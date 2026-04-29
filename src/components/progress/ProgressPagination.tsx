import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Button from "../Button";
import Input from "../Input";

interface ProgressPaginationProps {
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onCurrentPageChange: (value: number) => void;
}

export default function ProgressPagination({
  totalPages,
  currentPage,
  itemsPerPage,
  onItemsPerPageChange,
  onCurrentPageChange,
}: ProgressPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
          aria-label="Items per page"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
        <span className="text-xs sm:text-sm text-[#B0B0B0]">por página</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onCurrentPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg disabled:opacity-50 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors flex items-center justify-center gap-2"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Input
          name="page"
          type="number"
          value={currentPage}
          onChange={(e) => {
            const page = Number(e.target.value);
            if (page >= 1 && page <= totalPages) onCurrentPageChange(page);
          }}
          className="w-16 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-center h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
          aria-label="Jump to page"
        />
        <span className="text-xs sm:text-sm text-[#B0B0B0]">de {totalPages}</span>
        <Button
          onClick={() => onCurrentPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg disabled:opacity-50 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors flex items-center justify-center gap-2"
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}

