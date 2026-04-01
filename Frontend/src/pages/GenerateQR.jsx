import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Download,
  ChevronLeft,
  Loader2,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Footer from "../components/Footer";
import Header from "../components/Header";

const GenerateQR = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [lectureDate, setLectureDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [generating, setGenerating] = useState(false);
  const [qrData, setQrData] = useState(null);

  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = user?.token;
        const res = await fetch("/api/subjects/mine", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        const payload = await res.json();
        if (!res.ok) {
          setSubjects([]);
          return;
        }

        setSubjects(Array.isArray(payload?.data) ? payload.data : []);
      } catch {
        setSubjects([]);
      }
    };

    if (user?.token) {
      fetchSubjects();
    }
  }, [user?.token]);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(
        (word) =>
          word && !["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."].includes(word),
      )
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(user?.name);

  const handleGenerate = async () => {
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }
    if (!lectureDate) {
      setError("Please select a lecture date.");
      return;
    }
    setError("");
    setGenerating(true);
    setQrData(null);
    setDownloaded(false);

    try {
      const token = JSON.parse(
        sessionStorage.getItem("vit_user") ?? "{}",
      )?.token;
      const res = await fetch("/api/sessions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subjectId, date: lectureDate }),
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.message || "Failed to generate QR.");
        return;
      }
      setQrData(payload?.data || null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrData?.qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrData.qrDataUrl;
    link.download = `feedback-qr-${subjectId}-${lectureDate}.png`;
    link.click();
    setDownloaded(true);
  };

  const selectedSubject = subjects.find((s) => s._id === subjectId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header initials={initials} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <button
          onClick={() => navigate("/faculty/dashboard")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition mb-5 cursor-pointer"
          style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        <h1
          className="font-bold text-gray-600 mb-1"
          style={{ fontSize: "clamp(1.3rem,3vw,1.75rem)" }}>
          Generate Feedback QR
        </h1>
        <p
          className="text-blue-600 mb-8"
          style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)" }}>
          Select your lecture details below to generate a unique feedback code
          for students.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2
                className="font-bold text-gray-800 mb-5"
                style={{ fontSize: "clamp(0.95rem, 1.9vw, 1.1rem)" }}>
                Lecture Details
              </h2>

              <div className="mb-4">
                <label
                  className="block font-medium text-gray-700 mb-2"
                  style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setQrData(null);
                    setError("");
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                  style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label
                  className="block font-medium text-gray-700 mb-2"
                  style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
                  Lecture Date
                </label>
                <input
                  type="date"
                  value={lectureDate}
                  onChange={(e) => {
                    setLectureDate(e.target.value);
                    setQrData(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}
                />
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl mt-3"
                  style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.8rem)" }}>
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={14} color="white" />
              </div>
              <div>
                <p
                  className="font-semibold text-blue-700 mb-1"
                  style={{ fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)" }}>
                  Classroom Tip
                </p>
                <p
                  className="text-blue-600"
                  style={{ fontSize: "clamp(0.72rem, 1.4vw, 0.8rem)" }}>
                  Project the QR code on the main screen for at least 2 minutes
                  at the end of class for best response rates.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div
              className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 mb-5"
              style={{ minHeight: "clamp(12rem, 28vw, 18rem)" }}>
              {generating ? (
                <div className="flex flex-col items-center gap-3 text-blue-600">
                  <Loader2 size={36} className="animate-spin" />
                  <p style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
                    Generating QR…
                  </p>
                </div>
              ) : qrData?.qrDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={qrData.qrDataUrl}
                    alt="Feedback QR Code"
                    className="rounded-xl shadow-md"
                    style={{
                      width: "clamp(10rem, 18vw, 14rem)",
                      height: "clamp(10rem, 18vw, 14rem)",
                      objectFit: "contain",
                    }}
                  />
                  {selectedSubject && (
                    <div className="text-center">
                      <p
                        className="font-semibold text-gray-700"
                        style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
                        {selectedSubject.name}
                      </p>
                      <p
                        className="text-gray-400"
                        style={{ fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)" }}>
                        {selectedSubject.code} · {lectureDate}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <QrCode size={48} />
                  <p style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)" }}>
                    QR Code will appear here…
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 shadow-md shadow-blue-200 cursor-pointer"
                style={{ fontSize: "clamp(0.8rem, 1.6vw, 0.9rem)" }}>
                {generating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <QrCode size={15} /> Generate QR
                  </>
                )}
              </button>

              {qrData?.qrDataUrl && (
                <button
                  onClick={handleDownload}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border font-semibold rounded-xl transition ${
                    downloaded
                      ? "border-green-300 bg-green-50 text-green-600"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ fontSize: "clamp(0.8rem, 1.6vw, 0.9rem)" }}>
                  {downloaded ? (
                    <>
                      <CheckCircle size={15} /> Downloaded
                    </>
                  ) : (
                    <>
                      <Download size={15} /> Download PNG
                    </>
                  )}
                </button>
              )}
            </div>

            {qrData?.feedbackUrl && (
              <div className="mt-3 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                <span
                  className="text-gray-400 font-medium shrink-0"
                  style={{ fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)" }}>
                  Link:
                </span>
                <a
                  href={qrData.feedbackUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline truncate"
                  style={{ fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)" }}>
                  {qrData.feedbackUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenerateQR;
