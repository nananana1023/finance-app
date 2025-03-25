import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-12">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">MoneySavvy</h1>
      <div className="flex justify-center gap-5">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => navigate("/login")}
        >
          Log In
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => navigate("/register")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Home;
