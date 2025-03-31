import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export interface IASubmission {
  id?: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  email: string;
  title: string;
  material: string[];
  color: string[];
  function: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  pdfUrl: string;
  imageUrls: string[];
}

/**
 * Upload a PDF file to Firebase Storage
 * @param file PDF file to upload
 * @param submissionId Unique ID for the submission
 * @returns Download URL for the uploaded file
 */
export const uploadPDF = async (file: File, submissionId: string): Promise<string> => {
  // Create a reference to the PDF location in storage
  const pdfRef = ref(storage, `submissions/${submissionId}/pdf/${file.name}`);
  
  // Upload the file
  const snapshot = await uploadBytes(pdfRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Upload an image file to Firebase Storage
 * @param file Image file to upload
 * @param submissionId Unique ID for the submission
 * @param index Index of the image in the upload sequence
 * @returns Download URL for the uploaded file
 */
export const uploadImage = async (file: File, submissionId: string, index: number): Promise<string> => {
  // Create a reference to the image location in storage
  const imageRef = ref(storage, `submissions/${submissionId}/images/${index}_${file.name}`);
  
  // Upload the file
  const snapshot = await uploadBytes(imageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Save submission data to Firestore
 * @param submission Submission data
 * @returns The ID of the created document
 */
export const saveSubmission = async (submission: IASubmission): Promise<string> => {
  // Add a new document with a generated ID
  const docRef = await addDoc(collection(db, "submissions"), {
    ...submission,
    status: "pending", // Always set initial status to pending
    createdAt: serverTimestamp() // Use server timestamp for consistent timing
  });
  
  return docRef.id;
};

/**
 * Handle the complete submission process including file uploads and data storage
 * @param formData Form data from the submission component
 * @param updateProgress Callback function to update progress indicator
 * @returns Submission result with ID and URLs
 */
export const handleSubmission = async (
  formData: {
    firstName: string;
    lastName: string;
    gradeLevel: string;
    email: string;
    title: string;
    material: string[];
    color: string[];
    function: string[];
    pdf: File | null;
    images: File[];
  },
  updateProgress: (progress: number) => void
): Promise<{ id: string; pdfUrl: string; imageUrls: string[] }> => {
  // Generate a unique submission ID
  const submissionId = `submission_${Date.now()}`;
  
  if (!formData.pdf) {
    throw new Error("PDF is required");
  }
  
  // Upload PDF (25% of progress)
  updateProgress(5);
  const pdfUrl = await uploadPDF(formData.pdf, submissionId);
  updateProgress(25);
  
  // Upload images (65% of progress)
  const imageUrls: string[] = [];
  const totalImages = formData.images.length;
  
  for (let i = 0; i < totalImages; i++) {
    const image = formData.images[i];
    const imageUrl = await uploadImage(image, submissionId, i);
    imageUrls.push(imageUrl);
    
    // Update progress based on image upload progress
    const progressIncrement = 65 / totalImages;
    updateProgress(25 + (i + 1) * progressIncrement);
  }
  
  // Create submission data
  const submission: IASubmission = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    gradeLevel: formData.gradeLevel,
    email: formData.email,
    title: formData.title,
    material: formData.material,
    color: formData.color,
    function: formData.function,
    status: "pending",
    createdAt: serverTimestamp(),
    pdfUrl,
    imageUrls
  };
  
  // Save submission data to Firestore
  updateProgress(95);
  const docId = await saveSubmission(submission);
  updateProgress(100);
  
  return {
    id: docId,
    pdfUrl,
    imageUrls
  };
}; 