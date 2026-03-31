const COLORS = {
  Positive: "bg-green-100 text-green-700",
  Constructive: "bg-yellow-100 text-yellow-700",
  Negative: "bg-red-100 text-red-600",
};

const CommentCard = ({ initials, text, sentiment, date }) => {
  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
        {initials}
      </div>

      <div className="flex-1">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">
            {sentiment === "Positive"
              ? "Great Feedback"
              : sentiment === "Constructive"
                ? "Improvement Suggestion"
                : "Feedback"}
          </span>

          <span className="text-gray-400 text-xs">{date}</span>
        </div>

        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{text}</p>

        <span
          className={`mt-2 inline-block px-2 py-1 text-xs rounded ${COLORS[sentiment]}`}
        >
          {sentiment}
        </span>
      </div>
    </div>
  );
};

export default CommentCard;
