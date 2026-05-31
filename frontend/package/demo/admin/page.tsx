"use client";

import React from "react";
import { withRoleGuard } from "../../../hocs/withRoleGuard";

const AdminDemoPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">
        This page is protected by <code>withRoleGuard</code> and is only accessible to users with the <strong>admin</strong> role.
        If you are seeing this, the guard successfully validated your role!
      </p>
    </div>
  );
};

export default withRoleGuard(AdminDemoPage, ["admin"]);
