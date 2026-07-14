import Link from 'next/link';
import { StatusBadge, BountyBadge, CategoryBadge } from './Badges';
import { formatRelativeTime } from '@/lib/utils';

export interface QuestionCardProps {
  id: string;
  title: string;
  description: string;
  bounty: number;
  status: string;
  category?: string | null;
  tags?: string | null;
  _count?: { answers: number };
  author: { username: string; nickname: string };
  createdAt: string | Date;
}

export function QuestionCard({
  id, title, description, bounty, status, category, tags, _count, author, createdAt,
}: QuestionCardProps) {
  const tagList = tags ? tags.split(',').filter(Boolean) : [];
  const answerCount = _count?.answers || 0;

  return (
    <Link href={`/questions/${id}`} className="block">
      <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-bounty-300 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={status} />
              <BountyBadge amount={bounty} />
              <CategoryBadge category={category} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 group-hover:text-bounty-600 transition truncate">
              {title}
            </h3>

            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>

            {tagList.length > 0 && (
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {tagList.slice(0, 4).map(tag => (
                  <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
          <span>by {author.nickname || author.username}</span>
          <div className="flex items-center gap-3">
            {answerCount > 0 && <span>💬 {answerCount} 个回答</span>}
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
