// ============================================
// src/components/news/NewsCard.jsx
// ============================================

import { CalendarDays, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsCard({ item }) {

  return (
    <Link
      to={`/tin-tuc/${item.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >

      {/* IMAGE */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">

        <img
          src={
            item.thumbnailUrl ||
            'https://placehold.co/600x400?text=Agri'
          }
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* category */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 shadow-sm">
            {item.category || 'Tin nông nghiệp'}
          </span>
        </div>

      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">

        {/* META */}
        <div className="flex items-center gap-4 text-[12px] text-gray-400 font-medium mb-3">

          <div className="flex items-center gap-1">
            <CalendarDays size={14} />
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </div>

          <div className="flex items-center gap-1">
            <Eye size={14} />
            {item.viewCount || 0}
          </div>

        </div>

        {/* TITLE */}
        <h3 className="font-bold text-gray-800 text-[17px] leading-snug line-clamp-2 group-hover:text-emerald-700 transition min-h-[52px]">
          {item.title}
        </h3>

        {/* DESCRIPTION */}
        <div
          className="text-sm text-gray-500 leading-relaxed line-clamp-3 mt-2"
          dangerouslySetInnerHTML={{
            __html: item.content
          }}
        />

        {/* BUTTON */}
        <div className="mt-auto pt-4">

          <div className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 group-hover:text-orange-500 transition">

            Đọc tiếp

            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition"
            />

          </div>

        </div>

      </div>
    </Link>
  );
}