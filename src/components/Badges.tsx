export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: '等待回答', className: 'bg-green-100 text-green-700' },
    answered: { label: '已有回答', className: 'bg-blue-100 text-blue-700' },
    closed: { label: '已结单', className: 'bg-gray-100 text-gray-500' },
  };
  const { label, className } = config[status] || config.open;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function BountyBadge({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 bg-bounty-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
      ¥{amount.toFixed(2)}
    </span>
  );
}

export function CategoryBadge({ category }: { category?: string | null }) {
  if (!category) return null;
  const emojiMap: Record<string, string> = {
    '编程开发': '💻', '设计创意': '🎨', '数学科学': '🔬',
    '语言翻译': '🌍', '法律财务': '📊', '生活百科': '🏠',
    '职场求职': '💼', '学习教育': '📚', '其他': '🔮',
  };
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
      {emojiMap[category] || '📌'} {category}
    </span>
  );
}
