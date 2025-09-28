import Header from "@/components/Header";
import Chatbot from "@/components/Chatbot";

export const Home = () => {
  return (
    <>
      <Header />
      <div className="bg-gray-50 p-8">
        <Chatbot />
      </div>
    </>
  );
};

export default Home;
