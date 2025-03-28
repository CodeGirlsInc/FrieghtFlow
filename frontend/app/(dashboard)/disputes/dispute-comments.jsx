import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DisputeComments({
  comments,
  newComment,
  onNewCommentChange,
  onAddComment,
}) {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium">Comments</h3>

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage
                  src={comment.user.avatar}
                  alt={comment.user.name}
                />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="font-medium">{comment.user.name}</div>
                    <div className="text-sm text-subText">
                      {formatDateTime(comment.date)}
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">{comment.text}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-subText">
            No comments yet. Be the first to add a comment.
          </div>
        )}
      </div>
    </div>
  );
}
