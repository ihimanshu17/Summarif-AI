import React, { useState, useCallback, useRef } from 'react';
import { FileText, Trash2, BarChart2, CheckCircle, Loader, AlertTriangle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import SummaryOptions from './components/SummaryOptions';
import DocumentResult from './components/DocumentResult';
import { DocumentProcessor } from './services/documentProcessor';
import { AIService } from './services/aiService';
import Meteors from './components/Meteors';

function App() {
  const [documents, setDocuments] = useState([]);
  const [summaryOptions, setSummaryOptions] = useState({
    length: 'medium',
    style: 'paragraph',
  });
  const [processingStatus, setProcessingStatus] = useState(null);

  const documentProcessor = useRef(DocumentProcessor.getInstance());
  const aiService = useRef(new AIService());

  const isProcessing = processingStatus !== null;
  const hasApiKey = true;

  const generateDocumentId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = useCallback(
    async (file) => {
      const documentId = generateDocumentId();
      const newDocument = {
        id: documentId,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        file,
        createdAt: new Date(),
        status: 'extracting',
        summaryLength: summaryOptions.length,
      };

      setDocuments((prev) => [newDocument, ...prev]);

      try {
        const extractedText = await documentProcessor.current.processDocument(
          newDocument,
          (status) => setProcessingStatus({ ...status, documentName: newDocument.name })
        );

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId ? { ...doc, text: extractedText, status: 'extracted' } : doc
          )
        );
      } catch (error) {
        console.error('Processing error:', error);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId ? { ...doc, status: 'error', error: error.message } : doc
          )
        );
      } finally {
        setProcessingStatus(null);
      }
    },
    [summaryOptions]
  );

  const handleSummarize = async (document) => {
    if (!document.text || !hasApiKey) return;

    const documentId = document.id;

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, status: 'summarizing', error: undefined, summaryLength: summaryOptions.length }
          : doc
      )
    );

    try {
      const summary = await aiService.current.generateSummary(
        document.text,
        summaryOptions,
        (status) => setProcessingStatus({ ...status, documentName: document.name })
      );

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? { ...doc, summary, status: 'completed' } : doc))
      );
    } catch (error) {
      console.error('Summarization error:', error);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, status: 'error', error: error.message } : doc
        )
      );
    } finally {
      setProcessingStatus(null);
    }
  };

  const handleDeleteDocument = (documentId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const handleClearAll = () => {
    setDocuments([]);
    setProcessingStatus(null);
  };

  return (
    <div
      className="min-h-screen font-[Montserrat] text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #E92EFB, #FF2079, #440BD4, #04005E)`,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      {/* Meteors Background */}
      <Meteors count={25} />

      {/* Overlay glass gradient */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center items-center">
            <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl tracking-wide text-center">
              Summarif-AI
            </h1>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Upload card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl shadow-purple-900/30">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-pink-400" />
                Upload Document
              </h2>
              <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            </div>

            {/* Options */}
            <SummaryOptions options={summaryOptions} onChange={setSummaryOptions} disabled={isProcessing} />

            {/* Stats */}
            {documents.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl shadow-indigo-900/40">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <BarChart2 className="w-6 h-6 mr-3 text-yellow-400" />
                  Statistics
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center"><FileText className="w-4 h-4 mr-2" />Total Documents</span>
                    <span className="font-bold">{documents.length}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" />Completed</span>
                    {documents.filter((d) => d.status === 'completed').length}
                  </div>
                  <div className="flex justify-between text-indigo-400">
                    <span className="flex items-center"><Loader className="w-4 h-4 mr-2 animate-spin" />In Progress</span>
                    {documents.filter((d) => ['extracting', 'summarizing'].includes(d.status)).length}
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-2" />Errors</span>
                    {documents.filter((d) => d.status === 'error').length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document results */}
          <div className="lg:col-span-8 space-y-8">
            {processingStatus && (
              <ProcessingStatus status={processingStatus} documentName={processingStatus.documentName || 'Document'} />
            )}

            {documents.length === 0 && !isProcessing && (
              <div className="text-center py-24 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
                <h3 className="text-3xl font-bold mb-4">Looks a little empty here!</h3>
                <p className="text-gray-200 max-w-lg mx-auto">
                  Upload a PDF or image and let Summarif-AI create a quick summary for you.
                </p>
              </div>
            )}

            {documents.map((document) => (
              <div key={document.id} data-extracted-text>
                <DocumentResult
                  document={document}
                  onSummarize={() => handleSummarize(document)}
                  onDelete={() => handleDeleteDocument(document.id)}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
