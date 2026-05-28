import { Play, Eye, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VideoCard({ video }) {

  return (

    <Link
      to={`/video/${video.slug}`}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >

      {/* THUMBNAIL */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">

        <img
          src={
            video.thumbnailUrl ||
            'https://placehold.co/600x400?text=VIDEO'
          }
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* play */}
        <div className="absolute inset-0 flex items-center justify-center">

          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all">

            <Play
              size={24}
              fill="currentColor"
              className="text-white ml-1"
            />

          </div>

        </div>

        {/* tag */}
        <div className="absolute top-3 left-3">

          <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Video
          </span>

        </div>

      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">

        <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 text-[16px] group-hover:text-emerald-700 transition min-h-[52px]">
          {video.title}
        </h3>

        <div className="flex items-center justify-between mt-4 text-xs text-gray-500 font-medium">

          <div className="flex items-center gap-1">
            <Eye size={14} />
            {video.viewCount || 0}
          </div>

          <div className="flex items-center gap-1">
            <CalendarDays size={14} />
            {new Date(video.createdAt).toLocaleDateString('vi-VN')}
          </div>

        </div>

      </div>

    </Link>
  );
}