import React from 'react';
import { useParams } from 'react-router-dom';

function BoardPage() {
  const { id } = useParams(); 

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Đây là trang Bảng (Board)</h1>
      <p className="mt-4">ID của Bảng là: {id}</p>
    </div>
  );
}

export default BoardPage;