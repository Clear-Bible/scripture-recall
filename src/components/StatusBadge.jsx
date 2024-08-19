import { Badge } from "@/components/ui/badge";

 const statusColors = {
    "3": "bg-green-500",
    "2": "bg-yellow-500",
    "1": "bg-red-500",
  };

function StatusBadge({status}) {
// console.info("BADGE", status)
return (<Badge className={`${statusColors[status]}`}> &nbsp; </Badge>);

}

export default StatusBadge;
