"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Share2,
  Shield,
  Upload,
} from "lucide-react";

export default function ProfileHeader({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-inputBackground border-4 border-white shadow-md">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-inputBackground border-2 border-border">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="picture">Upload new picture</Label>
                    <Input id="picture" type="file" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {isEditing ? (
                  <Input
                    name="name"
                    value={editedUser.name}
                    onChange={handleChange}
                    className="text-2xl font-bold mb-2 h-10"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-headerText">
                    {user.name}
                  </h1>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="bg-inputBackground text-subText"
                  >
                    {user.role}
                  </Badge>
                  {user.verificationStatus === "verified" && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-subText">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <Input
                          name="email"
                          value={editedUser.email}
                          onChange={handleChange}
                          className="h-8"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <Input
                          name="contactNumber"
                          value={editedUser.contactNumber}
                          onChange={handleChange}
                          className="h-8"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <Input
                          name="address"
                          value={editedUser.address}
                          onChange={handleChange}
                          className="h-8"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{user.contactNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{user.address}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Privacy Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email Preferences</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-subText">
              <div>
                <span className="font-medium">Member since:</span>{" "}
                {user.memberSince}
              </div>
              <div>
                <span className="font-medium">Company:</span> {user.company}
              </div>
              <div>
                <span className="font-medium">Timezone:</span> {user.timezone}
              </div>
              <div>
                <span className="font-medium">Language:</span> {user.language}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
