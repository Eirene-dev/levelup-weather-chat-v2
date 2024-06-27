const LoadingIndicator = () => (
  <div className="flex items-center justify-center w-full h-8 max-w-md p-2 mb-8">
    <div className="w-8 h-8 mr-3 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    로딩 중...
  </div>
);

export default LoadingIndicator;
