// src/Page/Buyer/BuyerProfile.jsx
import React, { useEffect, useState } from "react";

const BuyerProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:3000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, []);

  if (!profile) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">โปรไฟล์ของฉัน</h1>
      <p><strong>ชื่อ:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>บทบาท:</strong> {profile.role}</p>
    </div>
  );
};

export default BuyerProfile;
