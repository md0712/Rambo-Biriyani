import React from "react";

// A simple placeholder page that shows no data.
// You can navigate to this component via your router (e.g., /admin/empty).

const EmptyPage = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>No Data Available</h2>
      <p>This page intentionally contains no data.</p>
    </div>
  );
};

export default EmptyPage;
