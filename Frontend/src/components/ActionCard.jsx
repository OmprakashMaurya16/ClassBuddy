import React from "react";

const ActionCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  bgGradient,
  iconColor,
  buttonStyle,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div
        className={`bg-linear-to-br ${bgGradient} flex items-center justify-center relative overflow-hidden h-28 sm:h-36`}>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md z-10">
          <Icon size={28} className={iconColor} />
        </div>

        <div className="absolute right-4 bottom-2 opacity-10">
          <Icon size={80} className={iconColor} />
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h2 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">
          {title}
        </h2>

        <p className="text-gray-500 flex-1 text-sm">{description}</p>

        <button
          onClick={onClick}
          className={`mt-5 w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 font-semibold rounded-xl transition cursor-pointer ${buttonStyle}`}>
          <Icon size={16} /> {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ActionCard;
