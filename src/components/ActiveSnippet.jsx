import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Speech, CircleChevronLeft } from "lucide-react";

import StatusBadge from "@/components/StatusBadge";

const ActiveSnippet = ({ snippet }) => {
  const navigate = useNavigate();

  return (
    <Card key={snippet.id}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Button
            className="m-0 p-0"
            variant="ghost"
            onClick={() => {
              navigate(-1);
            }}
          >
            <CircleChevronLeft strokeWidth={2} stroke={"currentColor"} />
          </Button>
          <div>{snippet.reference}</div>
          <div>
            <StatusBadge snippet={snippet} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ActiveSnippet;
