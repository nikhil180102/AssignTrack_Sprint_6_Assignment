import React, { useState, useMemo } from "react";
import { Mail, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useDispatch } from "react-redux";
import { format, isValid } from "date-fns";

import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { approveTeacher, rejectTeacher } from "../../features/admin/adminSlice";

const TeacherCard = ({ teacher, status }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const createdAt = teacher ? teacher.createdAt : null;
  const registeredDate = useMemo(() => {
    if (!createdAt) return null;
    const parsed = new Date(createdAt);
    return isValid(parsed) ? parsed : null;
  }, [createdAt]);

  const handleApprove = async () => {
    setLoading(true);
    await dispatch(approveTeacher(teacher.id));
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await dispatch(rejectTeacher(teacher.id));
    setLoading(false);
  };

  const getStatusBadge = () => {
    const badges = {
      PENDING: { variant: "warning", icon: Clock, text: "Pending" },
      APPROVED: { variant: "success", icon: CheckCircle2, text: "Approved" },
      REJECTED: { variant: "danger", icon: XCircle, text: "Rejected" },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <Badge variant={badge.variant}>
        <Icon className="w-3 h-3 mr-1 inline" />
        {badge.text}
      </Badge>
    );
  };

  const displayName =
    [teacher.firstName, teacher.lastName, teacher.first_name, teacher.last_name]
      .filter(Boolean)
      .join(" ") ||
    teacher.name ||
    teacher.fullName ||
    teacher.email?.split("@")[0] ||
    "Instructor";

  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {displayName}
            </h3>
            <p className="text-sm text-gray-600 capitalize">Instructor</p>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {teacher.email}
        </div>

        {registeredDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Registered: {format(registeredDate, "MMM dd, yyyy")}
          </div>
        )}
      </div>

      {status === "PENDING" && (
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button
            size="sm"
            variant="success"
            className="flex-1"
            icon={CheckCircle2}
            onClick={handleApprove}
            loading={loading}
          >
            Approve
          </Button>

          <Button
            size="sm"
            variant="danger"
            className="flex-1"
            icon={XCircle}
            onClick={handleReject}
            loading={loading}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
};

export default TeacherCard;
