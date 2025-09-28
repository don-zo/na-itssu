import BillCardList from "@/pages/BillPage/components/BillCardList";

export const BillPage = () => {
  return (
    <>
      <div className="text-center container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">법률안 목록</h1>
        <p className="text-gray-600 mb-8">
          현재 논의 중인 모든 법률안을 확인하고 투표에 참여하세요
        </p>
        <BillCardList />
      </div>
    </>
  );
};

export default BillPage;
