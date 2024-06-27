export default function Home() {
  return (
    <div className="flex flex-col items-center justify-between w-full h-screen">
      <div className="w-full h-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col justify-between h-full">
          <div className="overflow-y-auto"></div>
          <form className="flex w-full mt-4">
            <input
              className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
              placeholder="제주도 오늘의 날씨는 어때?"
            />
            <button
              className="px-1 text-sm text-white bg-blue-500 rounded-r-lg"
              type="submit"
            >
              전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
