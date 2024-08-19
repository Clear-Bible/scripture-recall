import { PlusCircle,  Book } from 'lucide-react';

 const EmptyState = () => (
    <div className="text-center py-10">
      <Book className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No snippets</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by adding a new scripture snippet.</p>
      <div className="mt-6">
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Snippet
        </Button>
      </div>
    </div>
  );

export default EmptyState;
