import { useState, useEffect } from "react";
import {
  fetchPendingSubmissions,
  fetchApprovedSubmissions,
  fetchRejectedSubmissions,
  fetchColorTags,
  fetchMaterialTags,
  addColorTag,
  addMaterialTag,
  updateColorTag,
  updateMaterialTag,
  deleteColorTag,
  deleteMaterialTag
} from "../utils/fetchSupabase";
import type { ColorTag, MaterialTag } from "../utils/fetchSupabase";
import type { IASubmission } from "../utils/supabaseSubmission";
import { supabase } from "../utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { X, Edit, Save, Trash2, Check, ArrowUp, ArrowDown, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { sendApprovalEmail, sendRejectionEmail } from "../utils/emailjs";

// 创建一个管理员客户端，使用环境变量中的凭证
const createAdminClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (!url || !anonKey) {
    console.error('Supabase 环境变量未设置，无法创建管理员客户端');
    return null;
  }
  
  return createClient(url, anonKey);
};

const supabaseAdmin = createAdminClient();

interface AdminPanelProps {
    ias: IASubmission[];
}

interface TagType {
    id: string;
    name: string;
}

const AdminPanel = ({ ias }: AdminPanelProps) => {
    const [activeTab, setActiveTab] = useState("home");
    const [pendingIAs, setPendingIAs] = useState<IASubmission[]>([]);
    const [approvedIAs, setApprovedIAs] = useState<IASubmission[]>([]);
    const [rejectedIAs, setRejectedIAs] = useState<IASubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<IASubmission>>({
        title: "",
        description: "",
        material: [],
        color: [],
        function: [],
        imageUrls: []
    });
    const [removingImage, setRemovingImage] = useState<string | null>(null);
    const [editingSubmission, setEditingSubmission] = useState<IASubmission | null>(null);
    const [formData, setFormData] = useState<Partial<IASubmission>>({
        title: "",
        description: "",
        material: [],
        color: [],
        function: [],
        imageUrls: []
    });
    const [isImageDeleting, setIsImageDeleting] = useState(false);
    const [colorTags, setColorTags] = useState<ColorTag[]>([]);
    const [materialTags, setMaterialTags] = useState<MaterialTag[]>([]);
    const [newColorTag, setNewColorTag] = useState("");
    const [newMaterialTag, setNewMaterialTag] = useState("");
    const [editingColorTag, setEditingColorTag] = useState<string | null>(null);
    const [editingMaterialTag, setEditingMaterialTag] = useState<string | null>(null);
    const [editColorTagValue, setEditColorTagValue] = useState("");
    const [editMaterialTagValue, setEditMaterialTagValue] = useState("");
    const [isLoadingTags, setIsLoadingTags] = useState(false);

    // Available filter categories for tag editing
    const [filterCategories, setFilterCategories] = useState({
        material: [] as string[],
        color: [] as string[],
        function: [
          "Organization & Storage",
          "Life Improvement & Decor",
          "Health & Wellness",
          "Innovative Gadgets & Tools",
          "Accessibility & Mobility Solutions",
          "Other"
        ]
    });

    useEffect(() => {
        // Fetch IAs for the active tab
        const fetchIAs = async () => {
            setLoading(true);
            try {
                // Always fetch counts for dashboard
                const pendingData = await fetchPendingSubmissions();
                setPendingIAs(pendingData);
                
                const approvedData = await fetchApprovedSubmissions();
                setApprovedIAs(approvedData);
                
                const rejectedData = await fetchRejectedSubmissions();
                setRejectedIAs(rejectedData);
            } catch (error) {
                console.error("Error fetching IAs:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchIAs();
    }, [activeTab]);
    
    // 加载标签 - 在组件挂载时
    useEffect(() => {
        console.log("Initial tags loading");
        loadTags();
    }, []);

    useEffect(() => {
        if (activeTab === "classification") {
            loadTags();
        }
    }, [activeTab]);

    const loadTags = async () => {
        try {
            console.log("Starting to load tags...");
            setIsLoadingTags(true);
            
            const colorTagsData = await fetchColorTags();
            console.log("Color tags loaded:", colorTagsData);
            
            const materialTagsData = await fetchMaterialTags();
            console.log("Material tags loaded:", materialTagsData);
            
            setColorTags(colorTagsData);
            setMaterialTags(materialTagsData);
            
            // Update filterCategories with the loaded tags
            setFilterCategories(prev => {
                const newCategories = {
                    ...prev,
                    color: [...colorTagsData.map(tag => tag.name), "Other"],
                    material: [...materialTagsData.map(tag => tag.name), "Other"]
                };
                console.log("Updated filterCategories:", newCategories);
                return newCategories;
            });
        } catch (error) {
            console.error("Error loading tags:", error);
            toast.error("Failed to load tags");
        } finally {
            setIsLoadingTags(false);
            console.log("Finished loading tags");
        }
    };

    const handleApproveIADirect = async (id: string | undefined) => {
        if (!id) {
            toast.error("Error: Missing submission ID");
            return;
        }
        
        if (confirm("Are you sure you want to approve this submission?")) {
            try {
                console.log(`Approving IA with ID: ${id} (Direct method)`);
                
                // Find the submission first to verify it exists
                const { data: submission, error: fetchError } = await supabase
                    .from('submissions')
                    .select('id, firstName, lastName, email, title, material, color, function')
                    .eq('id', id)
                    .single();
                
                if (fetchError) {
                    console.error("Error fetching submission:", fetchError);
                    toast.error(`Failed to fetch submission: ${fetchError.message}`);
                    return;
                }
                
                if (!submission) {
                    toast.error("Submission not found");
                    return;
                }
                
                console.log("Found submission:", {
                    id: submission.id,
                    title: submission.title,
                    hasOtherTags: {
                        material: submission.material?.some((m: string) => m?.startsWith?.('Other:')) || false,
                        color: submission.color?.some((c: string) => c?.startsWith?.('Other:')) || false,
                        function: submission.function?.some((f: string) => f?.startsWith?.('Other:')) || false
                    }
                });
                
                // Try updating with raw SQL query
                try {
                    const { data, error } = await supabase
                        .from('submissions')
                        .update({ status: 'approved' })
                        .eq('id', id);
                    
                    if (error) {
                        throw error;
                    }
                    
                    // 发送批准邮件
                    if (submission.email) {
                        try {
                            const emailSent = await sendApprovalEmail(
                                submission.email,
                                submission.title
                            );
                            
                            if (emailSent) {
                                console.log("✅ 批准邮件发送成功");
                            } else {
                                console.error("❌ 批准邮件发送失败");
                                toast.error("作品已批准，但邮件通知发送失败");
                            }
                        } catch (emailError) {
                            console.error("发送批准邮件时出错:", emailError);
                            toast.error("作品已批准，但邮件通知发送失败");
                        }
                    }
                    
                    // Success!
                    console.log("Successfully updated submission status to approved");
                    setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                    toast.success("IA approved successfully!");
                    return;
                } catch (updateError) {
                    console.error("Error using Supabase update:", updateError);
                    
                    // If regular update fails, try with raw SQL
                    try {
                        const { error: sqlError } = await supabase.rpc(
                            'execute_sql',
                            { 
                                sql_query: `UPDATE submissions SET status = 'approved' WHERE id = '${id}'` 
                            }
                        );
                        
                        if (sqlError) {
                            console.error("SQL Update error:", sqlError);
                            toast.error(`SQL update failed: ${sqlError.message}`);
                            return;
                        }
                        
                        // Success with SQL approach
                        console.log("Successfully approved using raw SQL");
                        setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                        toast.success("IA approved successfully!");
                    } catch (sqlExecutionError) {
                        console.error("SQL Execution error:", sqlExecutionError);
                        toast.error(`Failed to execute SQL: ${sqlExecutionError instanceof Error ? sqlExecutionError.message : "Unknown error"}`);
                    }
                }
            } catch (error) {
                console.error("Error approving IA:", error);
                toast.error(`Error approving IA: ${error instanceof Error ? error.message : "Please try again"}`);
            }
        }
    };
    
    const handleRejectIADirect = async (id: string | undefined) => {
        if (!id) {
            toast.error("Error: Missing submission ID");
            return;
        }
        
        // Get rejection reason from user
        const rejectionReason = prompt("Please provide a reason for rejecting this submission:");
        if (rejectionReason === null) {
            // User canceled the prompt
            return;
        }
        
        if (confirm("Are you sure you want to reject this submission? This will mark it as rejected.")) {
            try {
                console.log(`Rejecting IA with ID: ${id} (Direct method)`);
                
                // Find the submission first to verify it exists
                const { data: submission, error: fetchError } = await supabase
                    .from('submissions')
                    .select('id, firstName, lastName, email, title, material, color, function')
                    .eq('id', id)
                    .single();
                
                if (fetchError) {
                    console.error("Error fetching submission:", fetchError);
                    toast.error(`Failed to fetch submission: ${fetchError.message}`);
                    return;
                }
                
                if (!submission) {
                    toast.error("Submission not found");
                    return;
                }
                
                console.log("Found submission for rejection:", {
                    id: submission.id,
                    title: submission.title,
                    hasOtherTags: {
                        material: submission.material?.some((m: string) => m?.startsWith?.('Other:')) || false,
                        color: submission.color?.some((c: string) => c?.startsWith?.('Other:')) || false,
                        function: submission.function?.some((f: string) => f?.startsWith?.('Other:')) || false
                    }
                });
                
                // Try updating with raw SQL query
                try {
                    const { data, error } = await supabase
                        .from('submissions')
                        .update({ status: 'rejected' })
                        .eq('id', id);
                    
                    if (error) {
                        throw error;
                    }
                    
                    // 发送拒绝邮件 test
                    if (submission.email) {
                        try {
                            const emailSent = await sendRejectionEmail(
                                submission.email,
                                submission.title,
                                rejectionReason || "No specific reason provided"
                            );
                            
                            if (emailSent) {
                                console.log("✅ 拒绝邮件发送成功");
                            } else {
                                console.error("❌ 拒绝邮件发送失败");
                                toast.error("作品已拒绝，但邮件通知发送失败");
                            }
                        } catch (emailError) {
                            console.error("发送拒绝邮件时出错:", emailError);
                            toast.error("作品已拒绝，但邮件通知发送失败");
                        }
                    }
                    
                    // Success!
                    console.log("Successfully updated submission status to rejected");
                    setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                    toast.success("IA rejected successfully!");
                    return;
                } catch (updateError) {
                    console.error("Error using Supabase update:", updateError);
                    
                    // If regular update fails, try with raw SQL
                    try {
                        const { error: sqlError } = await supabase.rpc(
                            'execute_sql',
                            { 
                                sql_query: `UPDATE submissions SET status = 'rejected' WHERE id = '${id}'` 
                            }
                        );
                        
                        if (sqlError) {
                            console.error("SQL Update error:", sqlError);
                            toast.error(`SQL update failed: ${sqlError.message}`);
                            return;
                        }
                        
                        // Success with SQL approach
                        console.log("Successfully rejected using raw SQL");
                        setPendingIAs(prev => prev.filter(ia => ia.id !== id));
                        toast.success("IA rejected successfully!");
                    } catch (sqlExecutionError) {
                        console.error("SQL Execution error:", sqlExecutionError);
                        toast.error(`Failed to execute SQL: ${sqlExecutionError instanceof Error ? sqlExecutionError.message : "Unknown error"}`);
                    }
                }
            } catch (error) {
                console.error("Error rejecting IA:", error);
                toast.error(`Error rejecting IA: ${error instanceof Error ? error.message : "Please try again"}`);
            }
        }
    };

    const handleMoveToPending = async (id: string | undefined) => {
        if (!id) {
            toast.error("Error: Missing submission ID");
            return;
        }
        
        if (confirm("Are you sure you want to move this submission back to pending review?")) {
            try {
                console.log(`Moving submission to pending: ${id}`);
                
                // Get the admin password from environment
                const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
                
                // Find the submission in the rejected list before removing it
                const submissionToMove = rejectedIAs.find(ia => ia.id === id);
                
                // Update submission status to pending
                const { error } = await supabase
                    .from('submissions')
                    .update({ status: 'pending' })
                    .eq('id', id);
                
                if (error) {
                    throw new Error(`Failed to update submission status: ${error.message}`);
                }
                
                // Update UI by removing from rejected list
                setRejectedIAs(prev => prev.filter(ia => ia.id !== id));
                
                // If we found the submission, add it to the pending list with updated status
                if (submissionToMove) {
                    setPendingIAs(prev => [...prev, { ...submissionToMove, status: 'pending' }]);
                }
                
                toast.success("Submission moved to pending successfully!");
                
            } catch (error) {
                console.error("Error moving submission to pending:", error);
                toast.error(`Error: ${error instanceof Error ? error.message : "Please try again"}`);
            }
        }
    };

    const handlePermanentDelete = async (id: string | undefined) => {
        if (!id) {
            toast.error("错误: 缺少提交ID");
            return;
        }
        
        if (!supabaseAdmin) {
            toast.error("错误: 管理员客户端未初始化，请检查环境变量配置");
            return;
        }
        
        if (confirm("您确定要永久删除这个提交吗? 此操作无法撤销!")) {
            try {
                setIsDeleting(id);
                console.log(`永久删除ID为 ${id} 的提交`);
                
                // 查找提交的图片URLs
                const { data: submission, error: fetchError } = await supabase
                    .from('submissions')
                    .select('imageUrls')
                    .eq('id', id)
                    .single();
                
                if (fetchError) {
                    throw fetchError;
                }
                
                // 删除存储中的图片文件
                if (submission && submission.imageUrls && submission.imageUrls.length > 0) {
                    for (const imageUrl of submission.imageUrls) {
                        try {
                            // 从URL提取存储路径
                            const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/(.+)/);
                            if (pathMatch && pathMatch[1]) {
                                const path = decodeURIComponent(pathMatch[1]);
                                const { error: storageError } = await supabaseAdmin.storage
                                    .from('submissions-images')
                                    .remove([path]);
                                
                                if (storageError) {
                                    console.error(`删除图片失败: ${path}`, storageError);
                                }
                            }
                        } catch (imageError) {
                            console.error("删除图片时出错:", imageError);
                        }
                    }
                }
                
                // 删除数据库记录
                const { error: deleteError } = await supabaseAdmin
                    .from('submissions')
                    .delete()
                    .eq('id', id);
                
                if (deleteError) {
                    throw deleteError;
                }
                
                toast.success("提交已永久删除!");
                
                // 从状态中移除
                setRejectedIAs(prev => prev.filter(ia => ia.id !== id));
                setApprovedIAs(prev => prev.filter(ia => ia.id !== id));
                setPendingIAs(prev => prev.filter(ia => ia.id !== id));
            } catch (error) {
                console.error("删除提交时出错:", error);
                toast.error("删除失败。请稍后再试。");
            } finally {
                setIsDeleting(null);
            }
        }
    };

    // New functions for editing submission details
    const handleEditSubmission = (submission: IASubmission) => {
        console.log('Starting edit for submission:', submission);
        
        // 确保标签已加载
        if (colorTags.length === 0 || materialTags.length === 0) {
            console.log('Loading tags for edit mode...');
            loadTags();
        }
        
        // Make a copy of the submission data for editing
        const initialFormData = {
            title: submission.title || '',
            description: submission.description || '',
            material: submission.material ? [...submission.material] : [],
            color: submission.color ? [...submission.color] : [],
            function: submission.function ? [...submission.function] : [],
            imageUrls: submission.imageUrls ? [...submission.imageUrls] : []
        };
        
        console.log('Setting initial form data:', initialFormData);
        
        setEditingId(submission.id || null);
        setEditingSubmission(submission);
        setFormData(initialFormData);
        setEditFormData(initialFormData);
    };

    const handleCancelEdit = () => {
        console.log('Canceling edit');
        setEditingId(null);
        setEditingSubmission(null);
        setFormData({
            title: "",
            description: "",
            material: [],
            color: [],
            function: [],
            imageUrls: []
        });
        setEditFormData({
            title: "",
            description: "",
            material: [],
            color: [],
            function: [],
            imageUrls: []
        });
    };

    const handleUpdateSubmission = async (e: React.FormEvent<Element>) => {
        e.preventDefault();
        
        if (!editingSubmission || !editingSubmission.id) return;
        
        setIsUpdating(true);
        
        try {
            // Get admin password from session storage
            const adminPassword = window.sessionStorage.getItem('adminPassword') || '';
            
            console.log('Using admin password:', adminPassword ? '[Password found]' : '[No password]');
            
            // Log the editing state for debugging
            console.log('Debug - Current editing state: ', {
                editingId,
                formData,
                editFormData,
                editingSubmission
            });
            
            // Create a complete update payload with all fields
            const updateData = {
                title: editFormData.title || "Untitled",
                description: editFormData.description || "",
                material: editFormData.material || [],
                color: editFormData.color || [],
                function: editFormData.function || [],
                imageUrls: editFormData.imageUrls || []
            };
            
            // Log the data being sent
            console.log('Update data (with tags):', updateData);

            try {
                // First try with RLS disabled using the RPC function
                console.log('Attempting to disable RLS for update operation');
                try {
                    await supabase.rpc('disable_rls');
                    console.log('RLS disabled successfully');
                } catch (disableError) {
                    console.error('Failed to disable RLS:', disableError);
                    // Continue with the operation even if we couldn't disable RLS
                }
                
                // Try a direct update with supabase client
                console.log('Attempting direct Supabase update with RLS potentially disabled');
                
                const { data, error } = await supabase
                    .from('submissions')
                    .update(updateData)
                    .eq('id', editingSubmission.id)
                    .select();
                    
                // Re-enable RLS
                try {
                    await supabase.rpc('enable_rls');
                    console.log('RLS re-enabled successfully');
                } catch (enableError) {
                    console.error('Failed to re-enable RLS:', enableError);
                }
                
                if (error) {
                    console.error('Supabase update error:', error);
                    throw error;
                }
                
                console.log('Supabase update successful:', data);
            } catch (firstError) {
                console.error('First update attempt failed:', firstError);
                
                // Fallback to a direct update with standard permissions
                console.log('Trying standard update as fallback');
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('submissions')
                    .update(updateData)
                    .eq('id', editingSubmission.id)
                    .select();
                    
                if (fallbackError) {
                    console.error('Fallback update also failed:', fallbackError);
                    
                    // Last resort: Use the admin client directly
                    console.log('Trying admin client as last resort');
                    
                    // Make sure supabaseAdmin is properly initialized with service role key
                    const adminClient = createClient(
                        'https://umdpfeaqppqnosfgaepe.supabase.co',
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZHBmZWFxcHBxbm9zZmdhZXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDE0ODEsImV4cCI6MjA1ODk3NzQ4MX0.SjJVU3rESaDp9Bg9fPJx9jURIMF_bQT5r3d9Kq8CLGA'
                    );
                    
                    const { data: adminData, error: adminError } = await adminClient
                        .from('submissions')
                        .update(updateData)
                        .eq('id', editingSubmission.id)
                        .select();
                        
                    if (adminError) {
                        console.error('Admin client update also failed:', adminError);
                        
                        // Absolute last resort: Try a specialized API endpoint
                        console.log('Trying specialized direct update API as absolute last resort');
                        
                        try {
                            // Use Fetch API with specialized headers
                            const directUpdateResponse = await fetch(`https://umdpfeaqppqnosfgaepe.supabase.co/rest/v1/submissions?id=eq.${editingSubmission.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZHBmZWFxcHBxbm9zZmdhZXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDE0ODEsImV4cCI6MjA1ODk3NzQ4MX0.SjJVU3rESaDp9Bg9fPJx9jURIMF_bQT5r3d9Kq8CLGA',
                                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZHBmZWFxcHBxbm9zZmdhZXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDE0ODEsImV4cCI6MjA1ODk3NzQ4MX0.SjJVU3rESaDp9Bg9fPJx9jURIMF_bQT5r3d9Kq8CLGA',
                                    'Prefer': 'return=representation'
                                },
                                body: JSON.stringify(updateData)
                            });
                            
                            if (!directUpdateResponse.ok) {
                                throw new Error(`Direct API update failed: ${directUpdateResponse.status} ${directUpdateResponse.statusText}`);
                            }
                            
                            console.log('Direct API update successful');
                            return; // Exit early if successful
                        } catch (directError) {
                            console.error('Direct API update failed:', directError);
                            throw new Error(`All update methods failed. Final error: ${directError instanceof Error ? directError.message : 'Unknown error'}`);
                        }
                    }
                    
                    console.log('Admin client update successful:', adminData);
                    return; // Exit early if successful
                }
                
                console.log('Fallback update successful:', fallbackData);
            }
            
            // Update the list with the edited data based on submission status
            if (editingSubmission.status === 'approved') {
                setApprovedIAs(
                    approvedIAs.map((sub) =>
                        sub.id === editingSubmission.id
                            ? { 
                                ...sub, 
                                title: updateData.title,
                                description: updateData.description,
                                material: updateData.material,
                                color: updateData.color,
                                function: updateData.function,
                                imageUrls: updateData.imageUrls
                              }
                            : sub
                    ) as IASubmission[]
                );
            } else if (editingSubmission.status === 'pending') {
                setPendingIAs(
                    pendingIAs.map((sub) =>
                        sub.id === editingSubmission.id
                            ? { 
                                ...sub, 
                                title: updateData.title,
                                description: updateData.description,
                                material: updateData.material,
                                color: updateData.color,
                                function: updateData.function,
                                imageUrls: updateData.imageUrls
                              }
                            : sub
                    ) as IASubmission[]
                );
            } else if (editingSubmission.status === 'rejected') {
                setRejectedIAs(
                    rejectedIAs.map((sub) =>
                        sub.id === editingSubmission.id
                            ? { 
                                ...sub, 
                                title: updateData.title,
                                description: updateData.description,
                                material: updateData.material,
                                color: updateData.color,
                                function: updateData.function,
                                imageUrls: updateData.imageUrls
                              }
                            : sub
                    ) as IASubmission[]
                );
            }
            
            setEditingId(null);
            setEditingSubmission(null);
            setFormData({
                title: "",
                description: "",
                material: [],
                color: [],
                function: [],
                imageUrls: []
            });
            setEditFormData({
                title: "",
                description: "",
                material: [],
                color: [],
                function: [],
                imageUrls: []
            });
            toast.success('Submission updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update submission');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log(`Form field changed: ${name} = ${value}`);
        
        // Fix: Clone the previous state first, then modify it
        setEditFormData(prev => {
            // Create a deep copy of the previous state
            const prevCopy = JSON.parse(JSON.stringify(prev));
            
            // Update the specific field
            const updated = {
                ...prevCopy,
                [name]: value
            };
            
            console.log('Updated editFormData:', updated);
            return updated;
        });
    };

    const handleTagToggle = (category: string, value: string) => {
        console.log(`Toggling tag: ${category} - ${value}`);
        
        // Fix: Clone the previous state first, then modify it
        setEditFormData(prev => {
            // Create a deep copy of the previous state
            const prevCopy = JSON.parse(JSON.stringify(prev));
            
            // Ensure we're working with an array
            const currentTags = Array.isArray(prevCopy[category]) 
                ? prevCopy[category] 
                : [];
            
            // When toggling "Other", handle differently
            if (value === "Other") {
                // Check if we already have any "Other: something" values
                const hasOtherTag = currentTags.some(tag => 
                    typeof tag === 'string' && tag.startsWith('Other:')
                );
                
                // If we have an "Other: something" and we're removing "Other", 
                // remove all "Other: something" tags
                if (hasOtherTag) {
                    const updatedTags = currentTags.filter(tag => 
                        typeof tag === 'string' && !tag.startsWith('Other:')
                    );
                    return {
                        ...prevCopy,
                        [category]: updatedTags
                    };
                } else {
                    // Otherwise, add a generic "Other: " value
                    return {
                        ...prevCopy,
                        [category]: [...currentTags, "Other: "]
                    };
                }
            } else {
                // For non-Other tags, toggle as usual
                // If tag exists, remove it; otherwise, add it
                const updatedTags = currentTags.includes(value) 
                    ? currentTags.filter(tag => tag !== value)
                    : [...currentTags, value];
                
                // Create the new state
                const updated = {
                    ...prevCopy,
                    [category]: updatedTags
                };
                
                console.log(`Updated ${category} tags:`, updatedTags);
                console.log('Updated editFormData:', updated);
                return updated;
            }
        });
    };

    const handleOtherTagChange = (category: string, value: string) => {
        console.log(`Updating Other tag for ${category}: ${value}`);
        
        setEditFormData(prev => {
            // Create a deep copy of the previous state
            const prevCopy = JSON.parse(JSON.stringify(prev));
            
            // Ensure we're working with an array
            const currentTags = Array.isArray(prevCopy[category]) 
                ? [...prevCopy[category]] 
                : [];
                
            console.log(`Current ${category} tags before update:`, currentTags);
            
            // Find and replace the "Other:" tag with the new value
            const updatedTags = currentTags.map(tag => {
                if (typeof tag === 'string' && tag.startsWith('Other:')) {
                    console.log(`Replacing Other tag: "${tag}" with "Other: ${value}"`);
                    return `Other: ${value}`;
                }
                return tag;
            });
            
            console.log(`Updated ${category} tags after change:`, updatedTags);
            
            return {
                ...prevCopy,
                [category]: updatedTags
            };
        });
    };

    const handleDeleteImage = async (imageUrl: string) => {
        if (!editingSubmission) return;

        setIsImageDeleting(true);

        try {
            const adminPassword = window.sessionStorage.getItem('adminPassword') || '';
            
            // Use the API endpoint in the routes directory structure
            const response = await fetch('/api.deleteSubmissionImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingSubmission.id,
                    imageUrl,
                    password: adminPassword
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    // Try to parse as JSON
                    const errorJson = JSON.parse(errorText);
                    throw new Error(`Error deleting image: ${errorJson.error || 'Unknown error'}`);
                } catch (jsonError) {
                    // If not JSON, use text
                    throw new Error(`Server returned non-JSON response (${response.status}: ${response.statusText})`);
                }
            }

            const data = await response.json();
            
            // Update UI with the new image list
            const updatedImageUrls = formData.imageUrls?.filter(url => url !== imageUrl) || [];
            
            // Update both state variables
            setFormData({
                ...formData,
                imageUrls: updatedImageUrls
            });
            
            setEditFormData({
                ...editFormData,
                imageUrls: updatedImageUrls
            });

            // If we're editing the same submission that's in the approved list, update that too
            if (editingSubmission.status === 'approved') {
                setApprovedIAs(
                    approvedIAs.map((sub) =>
                        sub.id === editingSubmission.id
                            ? { ...sub, imageUrls: updatedImageUrls }
                            : sub
                    )
                );
            } else if (editingSubmission.status === 'pending') {
                setPendingIAs(
                    pendingIAs.map((sub) =>
                        sub.id === editingSubmission.id
                            ? { ...sub, imageUrls: updatedImageUrls }
                            : sub
                    )
                );
            } else if (editingSubmission.status === 'rejected') {
                setRejectedIAs(
                    rejectedIAs.map((sub) =>
                        sub.id === editingSubmission.id
                            ? { ...sub, imageUrls: updatedImageUrls }
                            : sub
                    )
                );
            }

            toast.success('Image deleted successfully!');
        } catch (error) {
            console.error('Image deletion error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete image');
        } finally {
            setIsImageDeleting(false);
        }
    };

    const handleMoveImage = (submissionId: string, imageUrl: string, direction: 'up' | 'down') => {
        // First find which list the submission belongs to
        const approvedSubmission = approvedIAs.find(ia => ia.id === submissionId);
        const pendingSubmission = pendingIAs.find(ia => ia.id === submissionId);
        const rejectedSubmission = rejectedIAs.find(ia => ia.id === submissionId);
        
        if (approvedSubmission) {
            // Update the approved list
            setApprovedIAs(prev => {
                return prev.map(ia => {
                    if (ia.id !== submissionId) return ia;
                    
                    const newImageUrls = [...ia.imageUrls];
                    const currentIndex = newImageUrls.indexOf(imageUrl);
                    
                    if (currentIndex === -1) return ia;
                    
                    if (direction === 'up' && currentIndex > 0) {
                        // Swap with previous image
                        [newImageUrls[currentIndex], newImageUrls[currentIndex - 1]] = 
                        [newImageUrls[currentIndex - 1], newImageUrls[currentIndex]];
                    } else if (direction === 'down' && currentIndex < newImageUrls.length - 1) {
                        // Swap with next image
                        [newImageUrls[currentIndex], newImageUrls[currentIndex + 1]] = 
                        [newImageUrls[currentIndex + 1], newImageUrls[currentIndex]];
                    }
                    
                    // If we're currently editing this submission, update both form data variables
                    if (editingId === submissionId) {
                        setFormData(prev => ({
                            ...prev,
                            imageUrls: newImageUrls
                        }));
                        
                        setEditFormData(prev => ({
                            ...prev,
                            imageUrls: newImageUrls
                        }));
                    }
                    
                    return {
                        ...ia,
                        imageUrls: newImageUrls
                    };
                });
            });
        } else if (pendingSubmission) {
            // Update the pending list
            setPendingIAs(prev => {
                return prev.map(ia => {
                    if (ia.id !== submissionId) return ia;
                    
                    const newImageUrls = [...ia.imageUrls];
                    const currentIndex = newImageUrls.indexOf(imageUrl);
                    
                    if (currentIndex === -1) return ia;
                    
                    if (direction === 'up' && currentIndex > 0) {
                        // Swap with previous image
                        [newImageUrls[currentIndex], newImageUrls[currentIndex - 1]] = 
                        [newImageUrls[currentIndex - 1], newImageUrls[currentIndex]];
                    } else if (direction === 'down' && currentIndex < newImageUrls.length - 1) {
                        // Swap with next image
                        [newImageUrls[currentIndex], newImageUrls[currentIndex + 1]] = 
                        [newImageUrls[currentIndex + 1], newImageUrls[currentIndex]];
                    }
                    
                    // If we're currently editing this submission, update both form data variables
                    if (editingId === submissionId) {
                        setFormData(prev => ({
                            ...prev,
                            imageUrls: newImageUrls
                        }));
                        
                        setEditFormData(prev => ({
                            ...prev,
                            imageUrls: newImageUrls
                        }));
                    }
                    
                    return {
                        ...ia,
                        imageUrls: newImageUrls
                    };
                });
            });
        } else if (rejectedSubmission) {
            // Update the rejected list
            setRejectedIAs(prev => {
                return prev.map(ia => {
                    if (ia.id !== submissionId) return ia;
                    
                    const newImageUrls = [...ia.imageUrls];
                    const currentIndex = newImageUrls.indexOf(imageUrl);
                    
                    if (currentIndex === -1) return ia;
                    
                    if (direction === 'up' && currentIndex > 0) {
                        // Swap with previous image
                        [newImageUrls[currentIndex], newImageUrls[currentIndex - 1]] = 
                        [newImageUrls[currentIndex - 1], newImageUrls[currentIndex]];
                    } else if (direction === 'down' && currentIndex < newImageUrls.length - 1) {
                        // Swap with next image
                        [newImageUrls[currentIndex], newImageUrls[currentIndex + 1]] = 
                        [newImageUrls[currentIndex + 1], newImageUrls[currentIndex]];
                    }
                    
                    // If we're currently editing this submission, update both form data variables
                    if (editingId === submissionId) {
                        setFormData(prev => ({
                            ...prev,
                            imageUrls: newImageUrls
                        }));
                        
                        setEditFormData(prev => ({
                            ...prev,
                            imageUrls: newImageUrls
                        }));
                    }
                    
                    return {
                        ...ia,
                        imageUrls: newImageUrls
                    };
                });
            });
        }
    };

    // Debugging: Log the current editing state
    console.log('Debug - Current editing state:', {
        editingId,
        formData,
        editFormData,
        editingSubmission: editingSubmission ? {
            id: editingSubmission.id,
            title: editingSubmission.title
        } : null
    });

    const handleAddColorTag = async () => {
        if (!newColorTag.trim()) {
            toast.error("Please enter a color tag name");
            return;
        }
        
        try {
            // 暂时禁用RLS (开发环境)
            await supabase.rpc('disable_rls');
            
            // 添加新标签
            const { data, error } = await supabase
                .from('color_tags')
                .insert({ name: newColorTag })
                .select()
                .single();
                
            // 重新启用RLS (开发环境)
            await supabase.rpc('enable_rls');

            if (error) {
                throw error;
            }

            setColorTags([...colorTags, data]);
            setNewColorTag("");
            toast.success("Color tag added successfully");
        } catch (error) {
            console.error("Error adding color tag:", error);
            toast.error(error instanceof Error ? error.message : "Failed to add color tag");
        }
    };

    const handleAddMaterialTag = async () => {
        if (!newMaterialTag.trim()) {
            toast.error("Please enter a material tag name");
            return;
        }
        
        try {
            // 暂时禁用RLS (开发环境)
            await supabase.rpc('disable_rls');
            
            // 添加新标签
            const { data, error } = await supabase
                .from('material_tags')
                .insert({ name: newMaterialTag })
                .select()
                .single();
                
            // 重新启用RLS (开发环境)
            await supabase.rpc('enable_rls');

            if (error) {
                throw error;
            }

            setMaterialTags([...materialTags, data]);
            setNewMaterialTag("");
            toast.success("Material tag added successfully");
        } catch (error) {
            console.error("Error adding material tag:", error);
            toast.error(error instanceof Error ? error.message : "Failed to add material tag");
        }
    };

    const handleStartEditColorTag = (tag: ColorTag) => {
        setEditingColorTag(tag.id);
        setEditColorTagValue(tag.name);
    };

    const handleStartEditMaterialTag = (tag: MaterialTag) => {
        setEditingMaterialTag(tag.id);
        setEditMaterialTagValue(tag.name);
    };

    const handleSaveColorTag = async (id: string) => {
        if (!editColorTagValue.trim()) {
            toast.error("Tag name cannot be empty");
            return;
        }
        
        try {
            // 暂时禁用RLS (开发环境)
            await supabase.rpc('disable_rls');
            
            // 更新标签
            const { error } = await supabase
                .from('color_tags')
                .update({ name: editColorTagValue })
                .eq('id', id);
                
            // 重新启用RLS (开发环境)
            await supabase.rpc('enable_rls');

            if (error) {
                throw error;
            }

            setColorTags(colorTags.map(tag => 
                tag.id === id ? { ...tag, name: editColorTagValue } : tag
            ));
            setEditingColorTag(null);
            toast.success("Color tag updated successfully");
        } catch (error) {
            console.error("Error updating color tag:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update color tag");
        }
    };

    const handleDeleteColorTag = async (id: string) => {
        if (confirm("Are you sure you want to delete this color tag?")) {
            try {
                // 暂时禁用RLS (开发环境)
                await supabase.rpc('disable_rls');
                
                // 删除标签
                const { error } = await supabase
                    .from('color_tags')
                    .delete()
                    .eq('id', id);
                    
                // 重新启用RLS (开发环境)
                await supabase.rpc('enable_rls');

                if (error) {
                    throw error;
                }

                setColorTags(colorTags.filter(tag => tag.id !== id));
                toast.success("Color tag deleted successfully");
            } catch (error) {
                console.error("Error deleting color tag:", error);
                toast.error(error instanceof Error ? error.message : "Failed to delete color tag");
            }
        }
    };

    const handleDeleteMaterialTag = async (id: string) => {
        if (confirm("Are you sure you want to delete this material tag?")) {
            try {
                // 暂时禁用RLS (开发环境)
                await supabase.rpc('disable_rls');
                
                // 删除标签
                const { error } = await supabase
                    .from('material_tags')
                    .delete()
                    .eq('id', id);
                    
                // 重新启用RLS (开发环境)
                await supabase.rpc('enable_rls');

                if (error) {
                    throw error;
                }

                setMaterialTags(materialTags.filter(tag => tag.id !== id));
                toast.success("Material tag deleted successfully");
            } catch (error) {
                console.error("Error deleting material tag:", error);
                toast.error(error instanceof Error ? error.message : "Failed to delete material tag");
            }
        }
    };

    const handleSaveMaterialTag = async (id: string) => {
        if (!editMaterialTagValue.trim()) {
            toast.error("Tag name cannot be empty");
            return;
        }
        
        try {
            // 暂时禁用RLS (开发环境)
            await supabase.rpc('disable_rls');
            
            // 更新标签
            const { error } = await supabase
                .from('material_tags')
                .update({ name: editMaterialTagValue })
                .eq('id', id);
                
            // 重新启用RLS (开发环境)
            await supabase.rpc('enable_rls');

            if (error) {
                throw error;
            }

            setMaterialTags(materialTags.map(tag => 
                tag.id === id ? { ...tag, name: editMaterialTagValue } : tag
            ));
            setEditingMaterialTag(null);
            toast.success("Material tag updated successfully");
        } catch (error) {
            console.error("Error updating material tag:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update material tag");
        }
    };

    // Add this debug log at the beginning of the component
    useEffect(() => {
        console.log("EmailJS Config Debug:", {
            publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? "Set (length: " + import.meta.env.VITE_EMAILJS_PUBLIC_KEY.length + ")" : "Not Set",
            serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ? "Set" : "Not Set",
            templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? "Set" : "Not Set"
        });
    }, []);

    return (
        <div className="flex h-screen font-sans">
            {/* Left Sidebar Navigation - Fixed position */}
            <nav className="w-40 bg-gray-200 fixed top-0 bottom-0 left-0 flex flex-col items-center py-4 shadow-md z-10">
                <div className="flex flex-col items-center flex-grow">
                    <button onClick={() => setActiveTab("home")} className={`mb-4 border cursor-pointer rounded-lg p-2 w-34 text-center flex items-center justify-center ${activeTab === "home" ? "bg-blue-100 border-blue-300" : ""} hover:bg-gray-100 transition-colors font-normal`}>
                        <span className="mr-2">🏠</span> Main panel
                    </button>
                    <button onClick={() => setActiveTab("approved")} className={`mb-4 border cursor-pointer rounded-lg p-2 w-34 text-center flex items-center justify-center ${activeTab === "approved" ? "bg-green-100 border-green-300" : ""} hover:bg-gray-100 transition-colors font-normal`}>
                        <span className="mr-2">✅</span> Approved
                    </button>
                    <button onClick={() => setActiveTab("pending")} className={`mb-4 border cursor-pointer rounded-lg p-2 w-34 text-center flex items-center justify-center ${activeTab === "pending" ? "bg-yellow-100 border-yellow-300" : ""} hover:bg-gray-100 transition-colors font-normal`}>
                        <span className="mr-2">⏳</span> Pending
                    </button>
                    <button onClick={() => setActiveTab("rejected")} className={`mb-4 border cursor-pointer rounded-lg p-2 w-34 text-center flex items-center justify-center ${activeTab === "rejected" ? "bg-red-100 border-red-300" : ""} hover:bg-gray-100 transition-colors font-normal`}>
                        <span className="mr-2">🗑️</span> Rejected
                    </button>
                    <button onClick={() => setActiveTab("classification")} className={`mb-4 border cursor-pointer rounded-lg p-2 w-34 text-center flex items-center justify-center ${activeTab === "classification" ? "bg-purple-100 border-purple-300" : ""} hover:bg-gray-100 transition-colors font-normal`}>
                        <span className="mr-2">📂</span> Classification
                    </button>
                </div>
                
                <button
                    className="p-2 bg-red-500 cursor-pointer text-white rounded w-34 text-center hover:bg-red-600 transition-colors mt-auto font-normal"
                    onClick={() => {
                        localStorage.removeItem("admin_authenticated");
                        localStorage.removeItem("admin_auth_expiration");
                        window.location.href = "/"; // Redirect to homepage
                    }}
                >
                    Logout
                </button>
            </nav>

            {/* Main Content - With left margin to account for fixed sidebar */}
            <div className="flex-1 p-6 overflow-y-auto ml-40 text-gray-800">
                {activeTab === "home" && (
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
                        <p className="mb-4 text-gray-600">Welcome to the admin panel.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-blue-100 p-4 rounded shadow">
                                <h2 className="font-bold">Total IAs</h2>
                                <p className="text-2xl">{pendingIAs.length + approvedIAs.length + rejectedIAs.length}</p>
                                
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium mb-2">All Submissions</h3>
                                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                        {[...pendingIAs, ...approvedIAs, ...rejectedIAs].slice(0, 10).map((ia) => (
                                            <div key={ia.id} className="bg-white rounded shadow-sm p-1 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab(ia.status === 'pending' ? 'pending' : ia.status === 'approved' ? 'approved' : 'rejected')}>
                                                {ia.pdfUrl ? (
                                                    <div className="h-24 flex items-center justify-center overflow-hidden bg-gray-100 rounded mb-1">
                                                        <object data={ia.pdfUrl + "#page=1&view=FitH"} type="application/pdf" className="w-full h-full">
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                                                PDF
                                                            </div>
                                                        </object>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 flex items-center justify-center bg-gray-100 rounded mb-1">
                                                        <span className="text-gray-400 text-xs">No PDF</span>
                                                    </div>
                                                )}
                                                <p className="text-xs truncate" title={ia.title}>{ia.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded shadow">
                                <h2 className="font-bold">Pending Approvals</h2>
                                <p className="text-2xl">{pendingIAs.length}</p>
                                
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium mb-2">Waiting Review</h3>
                                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                        {pendingIAs.slice(0, 10).map((ia) => (
                                            <div key={ia.id} className="bg-white rounded shadow-sm p-1 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pending')}>
                                                {ia.pdfUrl ? (
                                                    <div className="h-24 flex items-center justify-center overflow-hidden bg-gray-100 rounded mb-1">
                                                        <object data={ia.pdfUrl + "#page=1&view=FitH"} type="application/pdf" className="w-full h-full">
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                                                PDF
                                                            </div>
                                                        </object>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 flex items-center justify-center bg-gray-100 rounded mb-1">
                                                        <span className="text-gray-400 text-xs">No PDF</span>
                                                    </div>
                                                )}
                                                <p className="text-xs truncate" title={ia.title}>{ia.title}</p>
                                            </div>
                                        ))}
                                        {pendingIAs.length === 0 && (
                                            <div className="col-span-2 text-center py-6 text-gray-500 text-sm">
                                                No pending submissions
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-100 p-4 rounded shadow">
                                <h2 className="font-bold">Approved IAs</h2>
                                <p className="text-2xl">{approvedIAs.length}</p>
                                
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium mb-2">Published</h3>
                                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                        {approvedIAs.slice(0, 10).map((ia) => (
                                            <div key={ia.id} className="bg-white rounded shadow-sm p-1 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('approved')}>
                                                {ia.pdfUrl ? (
                                                    <div className="h-24 flex items-center justify-center overflow-hidden bg-gray-100 rounded mb-1">
                                                        <object data={ia.pdfUrl + "#page=1&view=FitH"} type="application/pdf" className="w-full h-full">
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                                                PDF
                                                            </div>
                                                        </object>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 flex items-center justify-center bg-gray-100 rounded mb-1">
                                                        <span className="text-gray-400 text-xs">No PDF</span>
                                                    </div>
                                                )}
                                                <p className="text-xs truncate" title={ia.title}>{ia.title}</p>
                                            </div>
                                        ))}
                                        {approvedIAs.length === 0 && (
                                            <div className="col-span-2 text-center py-6 text-gray-500 text-sm">
                                                No approved submissions
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-100 p-4 rounded shadow">
                                <h2 className="font-bold">Rejected IAs</h2>
                                <p className="text-2xl">{rejectedIAs.length}</p>
                                
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium mb-2">Not Approved</h3>
                                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                        {rejectedIAs.slice(0, 10).map((ia) => (
                                            <div key={ia.id} className="bg-white rounded shadow-sm p-1 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('rejected')}>
                                                {ia.pdfUrl ? (
                                                    <div className="h-24 flex items-center justify-center overflow-hidden bg-gray-100 rounded mb-1">
                                                        <object data={ia.pdfUrl + "#page=1&view=FitH"} type="application/pdf" className="w-full h-full">
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                                                PDF
                                                            </div>
                                                        </object>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 flex items-center justify-center bg-gray-100 rounded mb-1">
                                                        <span className="text-gray-400 text-xs">No PDF</span>
                                                    </div>
                                                )}
                                                <p className="text-xs truncate" title={ia.title}>{ia.title}</p>
                                            </div>
                                        ))}
                                        {rejectedIAs.length === 0 && (
                                            <div className="col-span-2 text-center py-6 text-gray-500 text-sm">
                                                No rejected submissions
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "approved" && (
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">Approved IA Submissions</h1>
                        <p className="mb-4 text-gray-600">View, edit, and manage approved IA submissions.</p>
                        
                        {loading ? (
                            <div className="flex justify-center my-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : approvedIAs.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded mt-4">
                                <p className="text-gray-500">No approved IAs found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 mt-4">
                                {approvedIAs.map((ia) => (
                                    <div key={ia.id} className="border rounded-lg overflow-hidden shadow-md bg-white border-green-200">
                                        <div className="p-4 border-b flex items-center justify-between bg-green-50">
                                            <div>
                                                <h3 className="font-semibold">Submission ID: {ia.id}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {ia.firstName} {ia.lastName} - {ia.title}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {ia.email} - Grade {ia.gradeLevel}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingId !== ia.id ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEditSubmission(ia)}
                                                            className="bg-blue-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-blue-600 transition-colors flex items-center"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMoveToPending(ia.id)}
                                                            className="bg-yellow-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-yellow-600 transition-colors"
                                                        >
                                                            Move to Pending
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePermanentDelete(ia.id)}
                                                            disabled={isDeleting === ia.id}
                                                            className={`${isDeleting === ia.id 
                                                                ? 'bg-gray-400' 
                                                                : 'bg-red-500 hover:bg-red-600'} 
                                                                text-white px-4 py-1 cursor-pointer rounded transition-colors`}
                                                        >
                                                            {isDeleting === ia.id ? 'Deleting...' : 'Delete Permanently'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={(e) => handleUpdateSubmission(e)}
                                                            disabled={isUpdating}
                                                            className={`${isUpdating 
                                                                ? 'bg-gray-400' 
                                                                : 'bg-green-500 hover:bg-green-600'} 
                                                                text-white px-4 py-1 cursor-pointer rounded transition-colors flex items-center`}
                                                        >
                                                            <Save className="w-4 h-4 mr-1" />
                                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                        <button 
                                                            onClick={handleCancelEdit}
                                                            className="bg-gray-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-gray-600 transition-colors flex items-center"
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {editingId === ia.id ? (
                                            <div className="p-4">
                                                <h4 className="font-semibold mb-3">Edit Project Details</h4>
                                                
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
                                                        Project Title
                                                    </label>
                                                    <input
                                                        id="title"
                                                        name="title"
                                                        type="text"
                                                        value={editFormData.title || ''}
                                                        onChange={handleFormChange}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    />
                                                </div>
                                                
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                                                        Project Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        value={editFormData.description || ''}
                                                        onChange={handleFormChange}
                                                        rows={4}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        placeholder="Enter a description of the project"
                                                    />
                                                </div>
                                                
                                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Materials selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Materials
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.material.map(mat => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = mat === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.material?.some(m => typeof m === 'string' && m.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.material?.includes(mat) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={mat}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('material', mat)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-blue-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {mat}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" material */}
                                                        {editFormData.material?.some(m => typeof m === 'string' && m.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other material:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.material.find(m => typeof m === 'string' && m.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('material', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom material"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Colors selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Colors
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.color.map(col => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = col === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.color?.some(c => typeof c === 'string' && c.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.color?.includes(col) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={col}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('color', col)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-purple-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {col}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" color */}
                                                        {editFormData.color?.some(c => typeof c === 'string' && c.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other color:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.color.find(c => typeof c === 'string' && c.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('color', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom color"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Functions selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Functions
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.function.map(func => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = func === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.function?.some(f => typeof f === 'string' && f.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.function?.includes(func) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={func}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('function', func)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-green-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {func}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" function */}
                                                        {editFormData.function?.some(f => typeof f === 'string' && f.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other function:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.function.find(f => typeof f === 'string' && f.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('function', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom function"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Images Manager */}
                                                <div className="mb-4">
                                                    <h5 className="text-gray-700 text-sm font-medium mb-2">
                                                        Images Manager
                                                    </h5>
                                                    <p className="text-sm text-gray-500 mb-3">
                                                        Reorder or delete images. The first image will be used as the thumbnail.
                                                    </p>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                            ia.imageUrls.map((img, idx) => (
                                                                <div 
                                                                    key={img}
                                                                    className="relative border rounded overflow-hidden group"
                                                                >
                                                                    <img 
                                                                        src={img} 
                                                                        alt={`Image ${idx + 1}`}
                                                                        className="w-full h-32 object-cover"
                                                                    />
                                                                    
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <div className="flex gap-1">
                                                                            {idx > 0 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleMoveImage(ia.id || '', img, 'up')}
                                                                                    className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                                                                                    title="Move up"
                                                                                >
                                                                                    <ArrowUp className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                            
                                                                            {idx < ia.imageUrls.length - 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleMoveImage(ia.id || '', img, 'down')}
                                                                                    className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                                                                                    title="Move down"
                                                                                >
                                                                                    <ArrowDown className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                            
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteImage(img)}
                                                                                disabled={isImageDeleting}
                                                                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                                                title="Delete image"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {isImageDeleting && (
                                                                        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                                                                            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {idx === 0 && (
                                                                        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1">
                                                                            Thumbnail
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-4 bg-gray-100 p-4 rounded text-gray-500 text-center">
                                                                No images available
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2">
                                                {/* PDF Preview */}
                                                <div className="mb-4">
                                                    <h4 className="font-semibold mb-2">PDF Document</h4>
                                                    {ia.pdfUrl ? (
                                                        <div className="inline-block border rounded p-2">
                                                            <a 
                                                                href={ia.pdfUrl} 
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                                                            >
                                                                <span>View PDF</span>
                                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-100 p-2 rounded text-gray-500 text-sm inline-block">
                                                            No PDF available
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Images Preview */}
                                                <div>
                                                    <h4 className="font-semibold mb-2">Uploaded Images</h4>
                                                    {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {ia.imageUrls.map((img, idx) => (
                                                                <a 
                                                                    key={idx}
                                                                    href={img}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block h-20 bg-gray-100 border rounded overflow-hidden"
                                                                >
                                                                    <img 
                                                                        src={img} 
                                                                        alt={`Preview ${idx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-100 p-4 rounded text-gray-500">
                                                            No images available
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Metadata */}
                                        <div className="p-4 border-t">
                                            <h4 className="font-semibold mb-2">Project Details</h4>
                                            
                                            {ia.description && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700">Description</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{ia.description}</p>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Materials</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.material ? ia.material.map((mat, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                                {mat}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No materials specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Colors</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.color ? ia.color.map((col, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                                {col}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No colors specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Functions</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.function ? ia.function.map((func, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                                {func}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No functions specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "pending" && (
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">Pending IA Approvals</h1>
                        <p className="mb-4 text-gray-600">Review, edit, and approve/reject submitted IAs.</p>
                        
                        {loading ? (
                            <div className="flex justify-center my-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : pendingIAs.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded mt-4">
                                <p className="text-gray-500">No pending IAs to approve at this time.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 mt-4">
                                {pendingIAs.map((ia) => (
                                    <div key={ia.id} className="border rounded-lg overflow-hidden shadow-md bg-white border-yellow-200">
                                        <div className="p-4 border-b flex items-center justify-between bg-yellow-50">
                                            <div>
                                                <h3 className="font-semibold">Submission ID: {ia.id}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {ia.firstName} {ia.lastName} - {ia.title}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {ia.email} - Grade {ia.gradeLevel}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingId !== ia.id ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEditSubmission(ia)}
                                                            className="bg-blue-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-blue-600 transition-colors flex items-center"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApproveIADirect(ia.id)}
                                                            className="bg-green-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectIADirect(ia.id)}
                                                            className="bg-red-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={(e) => handleUpdateSubmission(e)}
                                                            disabled={isUpdating}
                                                            className={`${isUpdating 
                                                                ? 'bg-gray-400' 
                                                                : 'bg-green-500 hover:bg-green-600'} 
                                                                text-white px-4 py-1 cursor-pointer rounded transition-colors flex items-center`}
                                                        >
                                                            <Save className="w-4 h-4 mr-1" />
                                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                        <button 
                                                            onClick={handleCancelEdit}
                                                            className="bg-gray-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-gray-600 transition-colors flex items-center"
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {editingId === ia.id ? (
                                            <div className="p-4">
                                                <h4 className="font-semibold mb-3">Edit Project Details</h4>
                                                
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
                                                        Project Title
                                                    </label>
                                                    <input
                                                        id="title"
                                                        name="title"
                                                        type="text"
                                                        value={editFormData.title || ''}
                                                        onChange={handleFormChange}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    />
                                                </div>
                                                
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                                                        Project Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        value={editFormData.description || ''}
                                                        onChange={handleFormChange}
                                                        rows={4}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        placeholder="Enter a description of the project"
                                                    />
                                                </div>
                                                
                                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Materials selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Materials
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.material.map(mat => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = mat === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.material?.some(m => typeof m === 'string' && m.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.material?.includes(mat) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={mat}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('material', mat)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-blue-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {mat}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" material */}
                                                        {editFormData.material?.some(m => typeof m === 'string' && m.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other material:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.material.find(m => typeof m === 'string' && m.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('material', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom material"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Colors selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Colors
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.color.map(col => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = col === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.color?.some(c => typeof c === 'string' && c.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.color?.includes(col) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={col}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('color', col)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-purple-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {col}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" color */}
                                                        {editFormData.color?.some(c => typeof c === 'string' && c.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other color:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.color.find(c => typeof c === 'string' && c.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('color', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom color"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Functions selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Functions
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.function.map(func => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = func === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.function?.some(f => typeof f === 'string' && f.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.function?.includes(func) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={func}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('function', func)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-green-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {func}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" function */}
                                                        {editFormData.function?.some(f => typeof f === 'string' && f.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other function:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.function.find(f => typeof f === 'string' && f.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('function', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom function"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Images Manager */}
                                                <div className="mb-4">
                                                    <h5 className="text-gray-700 text-sm font-medium mb-2">
                                                        Images Manager
                                                    </h5>
                                                    <p className="text-sm text-gray-500 mb-3">
                                                        Reorder or delete images. The first image will be used as the thumbnail.
                                                    </p>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                            ia.imageUrls.map((img, idx) => (
                                                                <div 
                                                                    key={img}
                                                                    className="relative border rounded overflow-hidden group"
                                                                >
                                                                    <img 
                                                                        src={img} 
                                                                        alt={`Image ${idx + 1}`}
                                                                        className="w-full h-32 object-cover"
                                                                    />
                                                                    
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <div className="flex gap-1">
                                                                            {idx > 0 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleMoveImage(ia.id || '', img, 'up')}
                                                                                    className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                                                                                    title="Move up"
                                                                                >
                                                                                    <ArrowUp className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                            
                                                                            {idx < ia.imageUrls.length - 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleMoveImage(ia.id || '', img, 'down')}
                                                                                    className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                                                                                    title="Move down"
                                                                                >
                                                                                    <ArrowDown className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                            
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteImage(img)}
                                                                                disabled={isImageDeleting}
                                                                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                                                title="Delete image"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {isImageDeleting && (
                                                                        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                                                                            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {idx === 0 && (
                                                                        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1">
                                                                            Thumbnail
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-4 bg-gray-100 p-4 rounded text-gray-500 text-center">
                                                                No images available
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2">
                                                {/* PDF Preview */}
                                                <div className="mb-4">
                                                    <h4 className="font-semibold mb-2">PDF Document</h4>
                                                    {ia.pdfUrl ? (
                                                        <div className="inline-block border rounded p-2">
                                                            <a 
                                                                href={ia.pdfUrl} 
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                                                            >
                                                                <span>View PDF</span>
                                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-100 p-2 rounded text-gray-500 text-sm inline-block">
                                                            No PDF available
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Images Preview */}
                                                <div>
                                                    <h4 className="font-semibold mb-2">Uploaded Images</h4>
                                                    {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {ia.imageUrls.map((img, idx) => (
                                                                <a 
                                                                    key={idx}
                                                                    href={img}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block h-20 bg-gray-100 border rounded overflow-hidden"
                                                                >
                                                                    <img 
                                                                        src={img} 
                                                                        alt={`Preview ${idx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-100 p-4 rounded text-gray-500">
                                                            No images available
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Metadata */}
                                        <div className="p-4 border-t">
                                            <h4 className="font-semibold mb-2">Project Details</h4>
                                            
                                            {ia.description && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700">Description</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{ia.description}</p>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Materials</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.material ? ia.material.map((mat, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                                {mat}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No materials specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Colors</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.color ? ia.color.map((col, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                                {col}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No colors specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Functions</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.function ? ia.function.map((func, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                                {func}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No functions specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "rejected" && (
                    <div className="relative">
                        <h1 className="text-2xl font-semibold mb-2">Rejected Submissions</h1>
                        <p className="mb-4 text-gray-600">View and manage rejected IA submissions.</p>
                        
                        {loading ? (
                            <div className="flex justify-center my-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : rejectedIAs.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded mt-4">
                                <p className="text-gray-500">No rejected submissions found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 mt-4">
                                {rejectedIAs.map((ia) => (
                                    <div key={ia.id} className="border rounded-lg overflow-hidden shadow-md bg-white border-red-200">
                                        <div className="p-4 border-b flex items-center justify-between bg-red-50">
                                            <div>
                                                <h3 className="font-semibold">Submission ID: {ia.id}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {ia.firstName} {ia.lastName} - {ia.title}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {ia.email} - Grade {ia.gradeLevel}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingId !== ia.id ? (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleEditSubmission(ia)}
                                                            className="bg-blue-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-blue-600 transition-colors flex items-center"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMoveToPending(ia.id)}
                                                            className="bg-yellow-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-yellow-600 transition-colors"
                                                        >
                                                            Move to Pending
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePermanentDelete(ia.id)}
                                                            disabled={isDeleting === ia.id}
                                                            className={`${isDeleting === ia.id 
                                                                ? 'bg-gray-400' 
                                                                : 'bg-red-500 hover:bg-red-600'} 
                                                                text-white px-4 py-1 cursor-pointer rounded transition-colors`}
                                                        >
                                                            {isDeleting === ia.id ? 'Deleting...' : 'Delete Permanently'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={(e) => handleUpdateSubmission(e)}
                                                            disabled={isUpdating}
                                                            className={`${isUpdating 
                                                                ? 'bg-gray-400' 
                                                                : 'bg-green-500 hover:bg-green-600'} 
                                                                text-white px-4 py-1 cursor-pointer rounded transition-colors flex items-center`}
                                                        >
                                                            <Save className="w-4 h-4 mr-1" />
                                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                        <button 
                                                            onClick={handleCancelEdit}
                                                            className="bg-gray-500 text-white px-4 py-1 cursor-pointer rounded hover:bg-gray-600 transition-colors flex items-center"
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {editingId === ia.id ? (
                                            <div className="p-4">
                                                <h4 className="font-semibold mb-3">Edit Project Details</h4>
                                                
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
                                                        Project Title
                                                    </label>
                                                    <input
                                                        id="title"
                                                        name="title"
                                                        type="text"
                                                        value={editFormData.title || ''}
                                                        onChange={handleFormChange}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    />
                                                </div>
                                                
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                                                        Project Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        value={editFormData.description || ''}
                                                        onChange={handleFormChange}
                                                        rows={4}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        placeholder="Enter a description of the project"
                                                    />
                                                </div>
                                                
                                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Materials selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Materials
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.material.map(mat => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = mat === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.material?.some(m => typeof m === 'string' && m.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.material?.includes(mat) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={mat}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('material', mat)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-blue-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {mat}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" material */}
                                                        {editFormData.material?.some(m => typeof m === 'string' && m.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other material:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.material.find(m => typeof m === 'string' && m.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('material', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom material"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Colors selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Colors
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.color.map(col => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = col === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.color?.some(c => typeof c === 'string' && c.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.color?.includes(col) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={col}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('color', col)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-purple-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {col}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" color */}
                                                        {editFormData.color?.some(c => typeof c === 'string' && c.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other color:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.color.find(c => typeof c === 'string' && c.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('color', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom color"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Functions selector */}
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                                            Functions
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filterCategories.function.map(func => {
                                                                // Check if it's an "Other" selection
                                                                const isOther = func === "Other";
                                                                // Check if we have any "Other: value" tags
                                                                const hasOtherTag = editFormData.function?.some(f => typeof f === 'string' && f.startsWith('Other:')) || false;
                                                                // Should this button be active?
                                                                const isActive = isOther 
                                                                    ? hasOtherTag
                                                                    : editFormData.function?.includes(func) || false;
                                                                    
                                                                return (
                                                                    <button 
                                                                        key={func}
                                                                        type="button"
                                                                        onClick={() => handleTagToggle('function', func)}
                                                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                                            isActive
                                                                                ? "bg-green-500 text-white"
                                                                                : "bg-gray-200 hover:bg-gray-300"
                                                                        }`}
                                                                    >
                                                                        {isActive ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                                        {func}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Input field for custom "Other" function */}
                                                        {editFormData.function?.some(f => typeof f === 'string' && f.startsWith('Other:')) && (
                                                            <div className="mt-2">
                                                                <label className="block text-gray-700 text-xs mb-1">
                                                                    Specify other function:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={(editFormData.function.find(f => typeof f === 'string' && f.startsWith('Other:')) || "Other: ").replace('Other: ', '')}
                                                                    onChange={(e) => handleOtherTagChange('function', e.target.value)}
                                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                    placeholder="Enter custom function"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Images Manager */}
                                                <div className="mb-4">
                                                    <h5 className="text-gray-700 text-sm font-medium mb-2">
                                                        Images Manager
                                                    </h5>
                                                    <p className="text-sm text-gray-500 mb-3">
                                                        Reorder or delete images. The first image will be used as the thumbnail.
                                                    </p>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                            ia.imageUrls.map((img, idx) => (
                                                                <div 
                                                                    key={img}
                                                                    className="relative border rounded overflow-hidden group"
                                                                >
                                                                    <img 
                                                                        src={img} 
                                                                        alt={`Image ${idx + 1}`}
                                                                        className="w-full h-32 object-cover"
                                                                    />
                                                                    
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <div className="flex gap-1">
                                                                            {idx > 0 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleMoveImage(ia.id || '', img, 'up')}
                                                                                    className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                                                                                    title="Move up"
                                                                                >
                                                                                    <ArrowUp className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                            
                                                                            {idx < ia.imageUrls.length - 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleMoveImage(ia.id || '', img, 'down')}
                                                                                    className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                                                                                    title="Move down"
                                                                                >
                                                                                    <ArrowDown className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                            
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteImage(img)}
                                                                                disabled={isImageDeleting}
                                                                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                                                title="Delete image"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {isImageDeleting && (
                                                                        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                                                                            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {idx === 0 && (
                                                                        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1">
                                                                            Thumbnail
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-4 bg-gray-100 p-4 rounded text-gray-500 text-center">
                                                                No images available
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2">
                                                {/* PDF Preview */}
                                                <div className="mb-4">
                                                    <h4 className="font-semibold mb-2">PDF Document</h4>
                                                    {ia.pdfUrl ? (
                                                        <div className="inline-block border rounded p-2">
                                                            <a 
                                                                href={ia.pdfUrl} 
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                                                            >
                                                                <span>View PDF</span>
                                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-100 p-2 rounded text-gray-500 text-sm inline-block">
                                                            No PDF available
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Images Preview */}
                                                <div>
                                                    <h4 className="font-semibold mb-2">Uploaded Images</h4>
                                                    {ia.imageUrls && ia.imageUrls.length > 0 ? (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {ia.imageUrls.map((img, idx) => (
                                                                <a 
                                                                    key={idx}
                                                                    href={img}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block h-20 bg-gray-100 border rounded overflow-hidden"
                                                                >
                                                                    <img 
                                                                        src={img} 
                                                                        alt={`Preview ${idx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-100 p-4 rounded text-gray-500">
                                                            No images available
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Metadata */}
                                        <div className="p-4 border-t">
                                            <h4 className="font-semibold mb-2">Project Details</h4>
                                            
                                            {ia.description && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700">Description</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{ia.description}</p>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Materials</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.material ? ia.material.map((mat, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                                {mat}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No materials specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Colors</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.color ? ia.color.map((col, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                                {col}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No colors specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700">Functions</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {ia.function ? ia.function.map((func, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                                {func}
                                                            </span>
                                                        )) : (
                                                            <span className="text-xs text-gray-500">No functions specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "classification" && (
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">Tag Management</h1>
                        <p className="mb-6 text-gray-600">Manage color and material tags that users can choose when submitting their projects.</p>
                        
                        {isLoadingTags ? (
                            <div className="flex justify-center my-8">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Color Tags Section */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-semibold mb-4 text-blue-600">Color Tags</h2>
                                    <p className="text-gray-600 mb-4">These tags will be available for users to select when submitting their IAs.</p>
                                    
                                    <div className="flex mb-4">
                                        <input
                                            type="text"
                                            placeholder="New color tag (e.g. Red)"
                                            className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            value={newColorTag}
                                            onChange={(e) => setNewColorTag(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddColorTag();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors flex items-center"
                                            onClick={handleAddColorTag}
                                        >
                                            <Plus size={16} className="mr-1" />
                                            Add
                                        </button>
                                    </div>
                                    
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {colorTags.length === 0 ? (
                                            <p className="text-gray-500 italic">No color tags added yet</p>
                                        ) : (
                                            <ul className="divide-y">
                                                {colorTags.map((tag) => (
                                                    <li key={tag.id} className="py-3 flex items-center justify-between">
                                                        {editingColorTag === tag.id ? (
                                                            <div className="flex-1 flex mr-2">
                                                                <input
                                                                    type="text"
                                                                    className="flex-1 border rounded px-2 py-1"
                                                                    value={editColorTagValue}
                                                                    onChange={(e) => setEditColorTagValue(e.target.value)}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="flex-1">{tag.name}</span>
                                                        )}
                                                        
                                                        <div className="flex space-x-2">
                                                            {editingColorTag === tag.id ? (
                                                                <>
                                                                    <button
                                                                        className="text-green-600 hover:text-green-800"
                                                                        onClick={() => handleSaveColorTag(tag.id)}
                                                                    >
                                                                        <Save size={18} />
                                                                    </button>
                                                                    <button
                                                                        className="text-gray-600 hover:text-gray-800"
                                                                        onClick={() => setEditingColorTag(null)}
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                        onClick={() => handleStartEditColorTag(tag)}
                                                                    >
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button
                                                                        className="text-red-600 hover:text-red-800"
                                                                        onClick={() => handleDeleteColorTag(tag.id)}
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Material Tags Section */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-semibold mb-4 text-green-600">Material Tags</h2>
                                    <p className="text-gray-600 mb-4">These tags will be available for users to select when submitting their IAs.</p>
                                    
                                    <div className="flex mb-4">
                                        <input
                                            type="text"
                                            placeholder="New material tag (e.g. Wood)"
                                            className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                                            value={newMaterialTag}
                                            onChange={(e) => setNewMaterialTag(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddMaterialTag();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600 transition-colors flex items-center"
                                            onClick={handleAddMaterialTag}
                                        >
                                            <Plus size={16} className="mr-1" />
                                            Add
                                        </button>
                                    </div>
                                    
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {materialTags.length === 0 ? (
                                            <p className="text-gray-500 italic">No material tags added yet</p>
                                        ) : (
                                            <ul className="divide-y">
                                                {materialTags.map((tag) => (
                                                    <li key={tag.id} className="py-3 flex items-center justify-between">
                                                        {editingMaterialTag === tag.id ? (
                                                            <div className="flex-1 flex mr-2">
                                                                <input
                                                                    type="text"
                                                                    className="flex-1 border rounded px-2 py-1"
                                                                    value={editMaterialTagValue}
                                                                    onChange={(e) => setEditMaterialTagValue(e.target.value)}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="flex-1">{tag.name}</span>
                                                        )}
                                                        
                                                        <div className="flex space-x-2">
                                                            {editingMaterialTag === tag.id ? (
                                                                <>
                                                                    <button
                                                                        className="text-green-600 hover:text-green-800"
                                                                        onClick={() => handleSaveMaterialTag(tag.id)}
                                                                    >
                                                                        <Save size={18} />
                                                                    </button>
                                                                    <button
                                                                        className="text-gray-600 hover:text-gray-800"
                                                                        onClick={() => setEditingMaterialTag(null)}
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                        onClick={() => handleStartEditMaterialTag(tag)}
                                                                    >
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button
                                                                        className="text-red-600 hover:text-red-800"
                                                                        onClick={() => handleDeleteMaterialTag(tag.id)}
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-8 p-4 bg-gray-100 rounded">
                            <h3 className="font-semibold text-gray-700">Managing Tags</h3>
                            <p className="text-gray-600">
                                Changes made here will affect what users see when submitting their projects. 
                                Be careful when editing or deleting tags that are already in use by existing projects.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;