/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Import the worker using Vite's ?url suffix to get a local URL
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

import { 
  FileUp, 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Presentation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configure PDF.js worker using the imported URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ConvertedImage {
  id: string;
  pageNumber: number;
  dataUrl: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ConvertedImage | null>(null);
  const [quality, setQuality] = useState(0.9);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setConvertedImages([]);
      setProgress(0);
    } else if (selectedFile) {
      setError('Please select a valid PDF file.');
    }
  };

  const convertPdfToJpg = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    setConvertedImages([]);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const images: ConvertedImage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error('Could not create canvas context');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        images.push({
          id: Math.random().toString(36).substr(2, 9),
          pageNumber: i,
          dataUrl: dataUrl
        });

        setProgress(Math.round((i / totalPages) * 100));
      }

      setConvertedImages(images);
    } catch (err) {
      console.error('Conversion error:', err);
      setError('An error occurred during conversion. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAll = async () => {
    if (convertedImages.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder('converted_images');

    convertedImages.forEach((img, index) => {
      const base64Data = img.dataUrl.split(',')[1];
      folder?.file(`page_${index + 1}.jpg`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace('.pdf', '')}_images.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSingle = (img: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = img.dataUrl;
    link.download = `page_${img.pageNumber}.jpg`;
    link.click();
  };

  const downloadAsPdf = async () => {
    if (convertedImages.length === 0) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    for (let i = 0; i < convertedImages.length; i++) {
      const img = convertedImages[i];
      
      // Create a temporary image to get dimensions
      const imgObj = new Image();
      imgObj.src = img.dataUrl;
      await new Promise((resolve) => {
        imgObj.onload = resolve;
      });

      const imgWidth = imgObj.width;
      const imgHeight = imgObj.height;

      // Set page size to match image size
      if (i === 0) {
        pdf.deletePage(1); // Remove default page
      }
      pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'landscape' : 'portrait');
      pdf.addImage(img.dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    pdf.save(`${file?.name.replace('.pdf', '')}_combined.pdf`);
  };

  const reset = () => {
    setFile(null);
    setConvertedImages([]);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Canva-style Top Bar */}
      <nav className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="canva-gradient p-2 rounded-lg">
            <FileText className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">PDF Converter</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-zinc-600 font-semibold text-sm px-4 py-2 hover:bg-zinc-100 rounded-lg transition-colors">
            Help
          </button>
          <button className="canva-button-primary !py-2 !px-6 !text-sm">
            Share
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl sm:text-7xl font-black tracking-tighter text-zinc-900 mb-8 leading-[1.05]"
            >
              Transform your PDF <br />
              <span className="inline-block px-8 py-3 canva-gradient text-white rounded-[24px] transform -rotate-1 mt-4 shadow-2xl hover:rotate-0 transition-transform duration-300 cursor-default">
                into stunning images
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Fast, free, and incredibly simple. Convert PDF pages to JPG in seconds 
              without ever leaving your browser.
            </motion.p>
          </header>

          <main>
            {/* Upload Section */}
            {!file && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="canva-card p-16 text-center hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all cursor-pointer group relative border-2 border-dashed border-zinc-200 hover:border-canva-purple"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile?.type === 'application/pdf') {
                    setFile(droppedFile);
                    setError(null);
                  } else {
                    setError('Please drop a valid PDF file.');
                  }
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  className="hidden" 
                />
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-zinc-100 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-indigo-50 transition-colors">
                    <FileUp className="w-10 h-10 text-zinc-400 group-hover:text-canva-purple transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-3">Upload your PDF</h3>
                  <p className="text-zinc-500 text-lg">Drag and drop or click to browse</p>
                </div>
              </motion.div>
            )}

            {/* File Selected / Converting Section */}
            {file && convertedImages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="canva-card p-10"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-canva-purple" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 truncate max-w-[300px] sm:max-w-lg">
                        {file.name}
                      </h3>
                      <p className="text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                    </div>
                  </div>
                  {!isConverting && (
                    <button 
                      onClick={reset}
                      className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {!isConverting && (
                  <div className="mb-10 p-6 bg-zinc-50 rounded-[20px] border border-zinc-100">
                    <div className="flex items-center justify-between mb-6">
                      <label className="text-base font-bold text-zinc-800 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-canva-teal" />
                        Image Quality
                      </label>
                      <span className="text-sm font-mono font-bold text-canva-purple bg-white px-3 py-1 rounded-full shadow-sm border border-zinc-100">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-canva-purple"
                      />
                      <input
                        type="number"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={quality}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) setQuality(Math.min(1, Math.max(0.1, val)));
                        }}
                        className="w-20 px-3 py-2 text-sm font-bold border border-zinc-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-canva-purple"
                      />
                    </div>
                    <p className="mt-4 text-sm text-zinc-400">
                      We recommend 80-90% for the best balance of quality and file size.
                    </p>
                  </div>
                )}

                {isConverting ? (
                  <div className="space-y-8">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-canva-purple flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Converting your masterpiece...
                      </span>
                      <span className="text-zinc-900">{progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full canva-gradient"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={convertPdfToJpg}
                    className="canva-button-primary w-full text-lg py-5 flex items-center justify-center gap-3"
                  >
                    Convert to JPG
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Results Section */}
            {convertedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-zinc-900">All done!</h3>
                      <p className="text-zinc-500">{convertedImages.length} pages ready for download</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={reset}
                      className="canva-button-secondary"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={downloadAsPdf}
                      className="canva-button-secondary flex items-center gap-2 border-canva-purple text-canva-purple hover:bg-indigo-50"
                    >
                      <Presentation className="w-5 h-5" />
                      Combine as PDF
                    </button>
                    <button
                      onClick={downloadAll}
                      className="canva-button-primary flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download ZIP
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {convertedImages.map((img) => (
                    <motion.div
                      key={img.id}
                      layoutId={img.id}
                      className="group canva-card overflow-hidden hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500"
                    >
                      <div 
                        className="aspect-[3/4] relative overflow-hidden bg-zinc-100 cursor-zoom-in"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img.dataUrl} 
                          alt={`Page ${img.pageNumber}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                            <ExternalLink className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-xs font-black text-zinc-900 shadow-sm">
                          PAGE {img.pageNumber}
                        </div>
                      </div>
                      <div className="p-5 flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-500 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-canva-teal" />
                          JPG
                        </span>
                        <button
                          onClick={() => downloadSingle(img)}
                          className="w-10 h-10 flex items-center justify-center bg-zinc-50 hover:bg-canva-purple hover:text-white rounded-xl text-zinc-400 transition-all"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-5 bg-red-50 border border-red-100 rounded-[20px] text-red-600 text-center font-bold"
              >
                {error}
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 bg-zinc-950/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              layoutId={selectedImage.id}
              className="relative max-w-6xl w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-16 right-0 p-3 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="relative w-full overflow-auto rounded-[32px] shadow-2xl bg-white border-8 border-white">
                <img 
                  src={selectedImage.dataUrl} 
                  alt={`Page ${selectedImage.pageNumber}`}
                  className="w-full h-auto rounded-[24px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-8 flex items-center gap-6">
                <button
                  onClick={() => {
                    const currentIndex = convertedImages.findIndex(img => img.id === selectedImage.id);
                    if (currentIndex > 0) setSelectedImage(convertedImages[currentIndex - 1]);
                  }}
                  disabled={convertedImages.findIndex(img => img.id === selectedImage.id) === 0}
                  className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 transition-all flex items-center justify-center"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <div className="px-8 py-3 bg-white/10 rounded-full text-white font-bold backdrop-blur-md border border-white/10">
                  Page {selectedImage.pageNumber} of {convertedImages.length}
                </div>
                <button
                  onClick={() => {
                    const currentIndex = convertedImages.findIndex(img => img.id === selectedImage.id);
                    if (currentIndex < convertedImages.length - 1) setSelectedImage(convertedImages[currentIndex + 1]);
                  }}
                  disabled={convertedImages.findIndex(img => img.id === selectedImage.id) === convertedImages.length - 1}
                  className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 transition-all flex items-center justify-center"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-10 text-zinc-400 text-sm text-center border-t border-zinc-200 bg-white">
        <p className="font-medium">© 2026 PDF Converter • Designed with Canva Style • Privacy Guaranteed</p>
      </footer>
    </div>
  );
}
