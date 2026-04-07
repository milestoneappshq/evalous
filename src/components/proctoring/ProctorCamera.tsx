"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as cocossd from '@tensorflow-models/coco-ssd';

interface ProctorCameraProps {
  onFlag: (reason: string, base64Snapshot: string) => void;
  isActive: boolean;
}

export function ProctorCamera({ onFlag, isActive }: ProctorCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [status, setStatus] = useState<string>('Initializing AI Engine...');
  const [isReady, setIsReady] = useState(false);
  
  const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const objModelRef = useRef<cocossd.ObjectDetection | null>(null);

  // Time tracking to avoid flooding the server with hundreds of snapshots
  const lastFlagTime = useRef<number>(0);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setStatus("Camera access denied. Test cannot proceed.");
    }
  };

  const loadModels = async () => {
    try {
      // Ensure backend is ready
      await tf.ready();
      setStatus('Loading models (this takes a moment)...');
      
      const [faceModel, objModel] = await Promise.all([
        blazeface.load(),
        cocossd.load()
      ]);
      
      faceModelRef.current = faceModel;
      objModelRef.current = objModel;
      
      setStatus('Proctoring Active');
      setIsReady(true);
    } catch (err) {
      console.error("Failed to load models:", err);
      setStatus("Failed to load security models.");
    }
  };

  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Compress heavily (quality 0.5) to save DB cost
    return canvas.toDataURL('image/jpeg', 0.5);
  }, []);

  const triggerFlag = useCallback((reason: string) => {
    const now = Date.now();
    // Allow maximum 1 flag every 10 seconds to prevent DB hammering
    if (now - lastFlagTime.current > 10000) {
      const snapshot = captureSnapshot();
      if (snapshot) {
        onFlag(reason, snapshot);
        lastFlagTime.current = now;
      }
    }
  }, [captureSnapshot, onFlag]);

  useEffect(() => {
    initCamera();
    loadModels();
    
    return () => {
      // Cleanup video stream on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive || !isReady || !videoRef.current) return;

    const intervalId = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) return;

      try {
        const [faces, objects] = await Promise.all([
          faceModelRef.current?.estimateFaces(video, false),
          objModelRef.current?.detect(video)
        ]);

        if (faces) {
          if (faces.length === 0) {
            triggerFlag('Candidate left the frame');
          } else if (faces.length > 1) {
            triggerFlag('Multiple persons detected in frame');
          }
        }

        if (objects) {
          const hasPhone = objects.some(obj => obj.class === 'cell phone' && obj.score > 0.6);
          if (hasPhone) {
            triggerFlag('Unauthorized device (cell phone) detected');
          }
        }
      } catch (err) {
         console.warn("Frame analysis skipped:", err);
      }

    }, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId);
  }, [isActive, isReady, triggerFlag]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-indigo-500 rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.3)] overflow-hidden flex flex-col w-48 transition-all hover:scale-105">
      <div className="bg-indigo-600 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">AI Proctor</span>
        </div>
      </div>
      
      <div className="relative aspect-video bg-black flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100" 
        />
        {!isReady && (
           <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-center p-2">
             <span className="text-xs text-slate-300 font-medium">{status}</span>
           </div>
        )}
      </div>
      
      {/* Hidden canvas used exclusively for base64 capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
