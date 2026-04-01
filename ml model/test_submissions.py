"""
test_submissions.py — ClassEcho Feedback Test Runner
Submits 5 pre-defined feedback forms to the running Flask server:
  ✅ 2 Positive  |  😐 1 Neutral  |  ❌ 2 Negative
Then opens the browser to display the live sentiment pie chart.
"""

import requests
import time
import webbrowser
import json

BASE_URL = "http://127.0.0.1:5000"
SESSION_ID = "test-session-demo-001"

# ─── Test Payloads ──────────────────────────────────────────────────────────
# 2 Positive, 1 Neutral, 2 Negative — ordered for clarity in output

SUBMISSIONS = [
    {
        "_label": "✅ POSITIVE #1",
        "studentName": "Priya Sharma",
        "rollNo": "CS22B001",
        "sessionId": SESSION_ID,
        "ratings": {
            "conceptClarity": 5,
            "lectureStructure": 5,
            "subjectMastery": 5,
            "practicalUnderstanding": 4,
            "studentEngagement": 5,
            "lecturePace": 4,
            "learningOutcomeImpact": 5,
        },
        "remark": (
            "The lecture was absolutely brilliant! "
            "The instructor explained every concept with great clarity and enthusiasm. "
            "The real-world examples made the topic much easier to understand."
        ),
    },
    {
        "_label": "✅ POSITIVE #2",
        "studentName": "Arjun Mehta",
        "rollNo": "CS22B002",
        "sessionId": SESSION_ID,
        "ratings": {
            "conceptClarity": 4,
            "lectureStructure": 5,
            "subjectMastery": 5,
            "practicalUnderstanding": 5,
            "studentEngagement": 4,
            "lecturePace": 4,
            "learningOutcomeImpact": 5,
        },
        "remark": (
            "Excellent session! The faculty was well-prepared and made complex "
            "topics feel simple. I felt very engaged throughout the lecture."
        ),
    },
    {
        "_label": "😐 NEUTRAL #1",
        "studentName": "Riya Kapoor",
        "rollNo": "CS22B003",
        "sessionId": SESSION_ID,
        "ratings": {
            "conceptClarity": 3,
            "lectureStructure": 3,
            "subjectMastery": 3,
            "practicalUnderstanding": 3,
            "studentEngagement": 3,
            "lecturePace": 3,
            "learningOutcomeImpact": 3,
        },
        "remark": (
            "The lecture was okay. Some parts were clear but others were hard to follow. "
            "Average overall experience, nothing exceptional."
        ),
    },
    {
        "_label": "❌ NEGATIVE #1",
        "studentName": "Sahil Verma",
        "rollNo": "CS22B004",
        "sessionId": SESSION_ID,
        "ratings": {
            "conceptClarity": 2,
            "lectureStructure": 1,
            "subjectMastery": 2,
            "practicalUnderstanding": 1,
            "studentEngagement": 2,
            "lecturePace": 1,
            "learningOutcomeImpact": 2,
        },
        "remark": (
            "The lecture was very confusing and poorly structured. "
            "The instructor rushed through the material without checking if we understood. "
            "I learned almost nothing from this session."
        ),
    },
    {
        "_label": "❌ NEGATIVE #2",
        "studentName": "Neha Iyer",
        "rollNo": "CS22B005",
        "sessionId": SESSION_ID,
        "ratings": {
            "conceptClarity": 1,
            "lectureStructure": 2,
            "subjectMastery": 2,
            "practicalUnderstanding": 1,
            "studentEngagement": 1,
            "lecturePace": 2,
            "learningOutcomeImpact": 1,
        },
        "remark": (
            "Terrible lecture. The faculty was unprepared, explanations were unclear, "
            "and there was no interaction with students at all. Very disappointing."
        ),
    },
]

# ─── Submit all forms ────────────────────────────────────────────────────────
def run():
    print("\n" + "═" * 60)
    print("  ClassEcho — Test Submission Runner")
    print("  Submitting 5 feedback forms to", BASE_URL)
    print("═" * 60 + "\n")

    results = []

    for i, sub in enumerate(SUBMISSIONS, 1):
        label = sub.pop("_label")          # remove internal label before sending
        print(f"[{i}/5] {label}")
        print(f"       Student : {sub['studentName']} ({sub['rollNo']})")
        print(f"       Remark  : {sub['remark'][:70]}…")

        try:
            resp = requests.post(
                f"{BASE_URL}/api/feedback",
                json=sub,
                timeout=30,
            )
            data = resp.json()

            if resp.status_code == 201:
                print(f"       → Avg Rating : {data['averageRating']}")
                print(f"       → Sentiment  : {data['sentiment']}  "
                      f"(source: {data['sentimentSource']})")
                results.append(data)
            else:
                print(f"       ⚠️  Error {resp.status_code}: {data.get('error')}")

        except requests.ConnectionError:
            print("       ❌ Cannot connect — make sure Flask is running on port 5000")
            return
        except Exception as exc:
            print(f"       ❌ Unexpected error: {exc}")

        print()
        time.sleep(0.5)   # small pause between submissions

    # ─── Summary ──────────────────────────────────────────────────────────────
    print("─" * 60)
    print("  Submission complete! Fetching aggregate stats…\n")

    try:
        stats = requests.get(
            f"{BASE_URL}/api/feedback/stats",
            params={"sessionId": SESSION_ID},
            timeout=10,
        ).json()

        total = stats.get("total", 0)
        counts = stats.get("counts", {})
        avg = stats.get("averageRating", 0)

        print(f"  Session     : {SESSION_ID}")
        print(f"  Total Forms : {total}")
        print(f"  Avg Rating  : {avg:.2f} / 5.00")
        print()
        for sentiment, count in counts.items():
            pct = round((count / total) * 100) if total else 0
            bar = "█" * pct + "░" * (100 - pct)
            icon = {"Positive": "✅", "Neutral": "😐", "Negative": "❌"}.get(sentiment, "")
            print(f"  {icon} {sentiment:<10}  {count}  {bar[:30]}  {pct}%")

    except Exception as exc:
        print(f"  Could not fetch stats: {exc}")

    # ─── Open browser to chart page ──────────────────────────────────────────
    chart_url = f"{BASE_URL}/?showStats=1&sessionId={SESSION_ID}"
    print(f"\n  Opening browser → {chart_url}")
    print("  (Submit the test form in the browser to see the live pie chart)\n")
    print("═" * 60 + "\n")
    webbrowser.open(f"{BASE_URL}/stats?sessionId={SESSION_ID}")


if __name__ == "__main__":
    run()
