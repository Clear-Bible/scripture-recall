import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex grow flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default Loader;
