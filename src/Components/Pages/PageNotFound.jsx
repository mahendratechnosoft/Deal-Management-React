import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-4xl font-bold">404</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition duration-300"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition duration-300"
            >
              Go Back
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Need help?{" "}
              <Link
                to="/login"
                className="font-medium hover:text-blue-800 transition duration-300"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2025 Mtech CRM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
