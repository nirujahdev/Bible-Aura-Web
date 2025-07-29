import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const PopularQuestions = () => {
  const questions = [
    "What does this verse mean?",
    "How can I grow in faith?",
    "What does the Bible say about forgiveness?",
    "How do I pray effectively?"
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Popular Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start text-left h-auto p-3 text-sm"
          >
            {question}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default PopularQuestions;