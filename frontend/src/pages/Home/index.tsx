export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            안녕하세요! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            홈 페이지에 오신 것을 환영합니다
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              프로젝트 정보
            </h2>
            <p className="text-blue-600">React + TypeScript + Tailwind CSS</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              기술 스택
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                React
              </span>
              <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                TypeScript
              </span>
              <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                Tailwind CSS
              </span>
              <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                Vite
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
