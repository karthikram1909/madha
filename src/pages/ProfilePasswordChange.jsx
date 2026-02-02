import React, { useState } from "react";
import UserDashboardLayout from "../components/user-dashboard/UserDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";


export default function ProfilePasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));


const [email, setEmail] = useState("");

useEffect(() => {
    // JSON.parse(localStorage.getItem("user"))

  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const userObj = JSON.parse(storedUser);

    // ✅ API sends email_id, NOT email
    const fetchedEmail = userObj.email_id || "";

    setEmail(fetchedEmail);
    console.log("Fetched email:", fetchedEmail);
  } catch (err) {
    console.error("Failed to parse user from localStorage", err);
  }
}, []);




  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return false;
    }
    if (!email) {
  toast.error("Email is required");
  return false;
}

    return true;
  };

  /* ---------------- SAVE HANDLER ---------------- */
const handleChangePassword = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSaving(true);
  setSaveSuccess(false);

  try {
    
    const payload = {
      email: email ,
      password: newPassword,
    };

    console.log("Sending password update payload:", payload);

    const response = await fetch(
      "https://secure.madhatv.in/api/v2/profilepasswordchange.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    console.log("PASSWORD CHANGE RESPONSE:", result);

    if (result?.error) {
      throw new Error(result.error_msg || "Password update failed");
    }

    toast.success("Password updated successfully");
    setSaveSuccess(true);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => setSaveSuccess(false), 3000);

  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to update password");
  } finally {
    setIsSaving(false);
  }
};





  return (
    <UserDashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          Change Password
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Password Details</CardTitle>
          </CardHeader>
<div style={{marginLeft:"25px"}}>
  <Label>Email *</Label>
<Input
  type="email"
  value={email} 
  disabled
  className="bg-slate-100 cursor-not-allowed"
/>


</div>

          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4 mt-3">

              {/* Current Password */}
              <div>
                <Label htmlFor="current_password">Current Password *</Label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="new_password">Password *</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

            </CardContent>

            <CardFooter className="flex justify-between items-center">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Password updated</span>
                </div>
              )}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Change Password
              </Button> 
            </CardFooter>
          </form>
        </Card>
      </div>
    </UserDashboardLayout>
  );
}
