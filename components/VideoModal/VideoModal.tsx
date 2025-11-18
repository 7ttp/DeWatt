import React from 'react';
import { useEffect } from 'react';
import { X } from "lucide-react"

interface VideoModalProps {
    onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ onClose }) => {
    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        const handleClickOutside = (event: MouseEvent) => {
          const modal = document.getElementById('video-modal');
          if (modal && !modal.contains(event.target as Node)) {
            onClose();
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.body.classList.remove('overflow-hidden');
        };
      }, [onClose]);

    return (
        <div className="fixed z-[1000] overflow-hidden top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center">
            <div className="bg-[#131413] border-[2px] border-[#161d15] p-4 rounded-lg md:w-[60%] sm:w-[90%] md:h-[65%] sm:h-[40%]" id="video-modal">
                <div className='flex justify-end mb-2'>
                    <button onClick={onClose} className="top-2 right-2 text-gray-500 hover:text-gray-700">
                        <X className='text-white hover:text-gray-400 transition' />
                    </button>
                </div>
                <iframe
                    className='w-full h-[93%]'
                    src="https://www.youtube.com/embed/o4ooB7YaL2E?si=33vFjulGg9j-26dP"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>

            </div>
        </div>
    );
};

export default VideoModal;
