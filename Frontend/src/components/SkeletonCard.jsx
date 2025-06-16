function SkeletonCard({ shape = "square" }) {
  const isCircle = shape === "circle";

  return (
    <div className="w-[160px] sm:min-w-[200px] flex-shrink-0 rounded-2xl p-2 animate-pulse">
      <div
        className={`m-auto bg-[#2a2a2a] ${
          isCircle ? "rounded-full" : "rounded-2xl"
        } ${isCircle ? "w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]" : "w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]"}`}
      ></div>
      <div className="h-4 bg-[#2a2a2a] rounded mt-4 w-3/4 mx-auto"></div>
      <div className="h-3 bg-[#2a2a2a] rounded mt-2 w-1/2 mx-auto"></div>
    </div>
  );
}

export default SkeletonCard;
