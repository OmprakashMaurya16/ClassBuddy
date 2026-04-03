from flask import Flask, request, jsonify, render_template
from datetime import datetime
import threading
import logging
import os

from config import MONGO_URI, DB_NAME, SECRET_KEY

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = SECRET_KEY

_mongo_client = None
_db = None

def _init_mongo():
    global _mongo_client, _db
    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        _db = client[DB_NAME]
        _mongo_client = client
        log.info("MongoDB connected: %s / %s", MONGO_URI, DB_NAME)
    except Exception as exc:
        log.warning("MongoDB unavailable (%s). Running without persistence.", exc)

_init_mongo()

_bert_pipeline = None
_bert_ready = threading.Event()
_bert_error = None

def _load_bert():
    global _bert_pipeline, _bert_error
    try:
        from transformers import pipeline
        log.info("Loading BERT model...")
        _bert_pipeline = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            truncation=True,
            max_length=512,
        )
        log.info("BERT model ready.")
    except Exception as exc:
        _bert_error = str(exc)
        log.warning("BERT unavailable (%s). Using rating-based sentiment.", exc)
    finally:
        _bert_ready.set()

threading.Thread(target=_load_bert, daemon=True).start()

_STAR_LABELS = {
    "1 star": 1, "2 stars": 2, "3 stars": 3, "4 stars": 4, "5 stars": 5,
}

def _label_from_stars(stars: int) -> str:
    if stars >= 4:
        return "Positive"
    elif stars == 3:
        return "Neutral"
    return "Negative"

def analyse_text(text: str) -> dict:
    if _bert_pipeline and text and text.strip():
        result = _bert_pipeline(text.strip()[:512])[0]
        stars = _STAR_LABELS.get(result["label"].lower(), 3)
        sentiment = _label_from_stars(stars)
        return {"sentiment": sentiment, "score": round(result["score"], 4), "source": "bert"}
    return None

def analyse_from_rating(avg: float) -> dict:
    if avg >= 3.5:
        sentiment = "Positive"
    elif avg >= 2.5:
        sentiment = "Neutral"
    else:
        sentiment = "Negative"
    return {"sentiment": sentiment, "score": None, "source": "rating"}

def _get_collection(name: str):
    return _db[name] if _db is not None else None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    required_keys = [
        "conceptClarity", "lectureStructure", "subjectMastery",
        "practicalUnderstanding", "studentEngagement",
        "lecturePace", "learningOutcomeImpact",
    ]
    ratings = data.get("ratings", {})
    missing = [k for k in required_keys if k not in ratings]
    if missing:
        return jsonify({"error": f"Missing ratings: {missing}"}), 422

    for key, val in ratings.items():
        if not isinstance(val, (int, float)) or not (1 <= val <= 5):
            return jsonify({"error": f"Rating '{key}' must be 1–5"}), 422

    student_name = (data.get("studentName") or "").strip().lower()
    roll_no = (data.get("rollNo") or "").strip().lower()
    remark = (data.get("remark") or "").strip()
    session_id = (data.get("sessionId") or "anonymous").strip()

    if not student_name or not roll_no:
        return jsonify({"error": "studentName and rollNo are required"}), 422

    values = list(ratings.values())
    avg_rating = round(sum(values) / len(values), 2)

    sentiment_info = None
    if remark:
        if _bert_pipeline:
            sentiment_info = analyse_text(remark)
        else:
            _bert_ready.wait(timeout=2)
            sentiment_info = analyse_text(remark)

    if sentiment_info is None:
        sentiment_info = analyse_from_rating(avg_rating)

    sentiment = sentiment_info["sentiment"]

    feedback_doc = {
        "sessionId": session_id,
        "studentName": student_name,
        "rollNo": roll_no,
        "ratings": ratings,
        "averageRating": avg_rating,
        "remark": remark,
        "sentiment": sentiment,
        "sentimentScore": sentiment_info.get("score"),
        "sentimentSource": sentiment_info.get("source"),
        "createdAt": datetime.utcnow(),
    }

    col = _get_collection("feedbacks")
    inserted_id = None
    if col is not None:
        try:
            result = col.insert_one(feedback_doc)
            inserted_id = str(result.inserted_id)
        except Exception as exc:
            log.warning("Mongo insert failed: %s", exc)

    return jsonify({
        "success": True,
        "averageRating": avg_rating,
        "sentiment": sentiment,
        "sentimentScore": sentiment_info.get("score"),
        "sentimentSource": sentiment_info.get("source"),
        "id": inserted_id,
    }), 201

@app.route("/api/feedback/stats", methods=["GET"])
def feedback_stats():
    session_id = request.args.get("sessionId")
    col = _get_collection("feedbacks")

    counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    total_avg = 0.0
    total_docs = 0

    if col is not None:
        query = {}
        if session_id:
            query["sessionId"] = session_id

        for doc in col.find(query, {"sentiment": 1, "averageRating": 1}):
            s = doc.get("sentiment", "Neutral")
            if s in counts:
                counts[s] += 1
            total_avg += doc.get("averageRating", 0)
            total_docs += 1

    overall = round(total_avg / total_docs, 2) if total_docs else 0

    return jsonify({
        "total": total_docs,
        "counts": counts,
        "averageRating": overall,
    })

@app.route("/api/feedback/list", methods=["GET"])
def feedback_list():
    session_id = request.args.get("sessionId")
    col = _get_collection("feedbacks")
    docs = []
    if col is not None:
        query = {}
        if session_id:
            query["sessionId"] = session_id
        for doc in col.find(query, {"_id": 0, "studentName": 1, "rollNo": 1,
                                    "averageRating": 1, "sentiment": 1, "remark": 1}):
            docs.append(doc)
    return jsonify(docs)

@app.route("/stats")
def stats_page():
    session_id = request.args.get("sessionId", "")
    return render_template("stats.html", session_id=session_id)

@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({
        "bert_ready": _bert_ready.is_set(),
        "bert_loaded": _bert_pipeline is not None,
        "bert_error": _bert_error,
        "mongo_connected": _db is not None,
    })

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3000"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", debug=debug, port=port, use_reloader=False)