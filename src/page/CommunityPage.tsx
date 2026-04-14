import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ImagePlus, MessageCircle, Send, Users, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../components/Footer';
import MainHeader from '../components/MainHeader';
import bannerImg from '../assets/images/banner.jpg';
import profileImg from '../assets/images/image_profile.png';
import { ChatbotWidget } from '../components/ChatbotWidget';
import type { AppDispatch, RootState } from '../store';
import {
    addCommunityCommentThunk,
    clearCommunityError,
    clearCommunityMediaErrors,
    createCommunityPostThunk,
    fetchCommunityGroupThunk,
    fetchCommunityPostDetailThunk,
    fetchCommunityPostsThunk,
} from '../store/slice/CommunitySlice';
import type { CommunityPostMediaResponse, CommunityPostResponse } from '../services/CommunityService';

const PAGE_SIZE = 10;

const formatDateTime = (value: string): string => {
    return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getAvatar = (avatarUrl?: string): string => {
    if (!avatarUrl || !avatarUrl.trim()) return profileImg;
    return avatarUrl;
};

const getMediaUrl = (media: CommunityPostMediaResponse): string => {
    return media.secureUrl || media.url;
};

const renderPostMedia = (media: CommunityPostMediaResponse[]) => {
    if (media.length === 0) return null;

    return (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {media.map((item) => (
                <img
                    key={item.id}
                    src={getMediaUrl(item)}
                    alt="community media"
                    className="h-52 w-full rounded-xl object-cover border border-gray-100"
                />
            ))}
        </div>
    );
};

export default function CommunityPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const user = useSelector((state: RootState) => state.login.user);
    const {
        group,
        posts,
        pagination,
        loadingList,
        creatingPost,
        commentSubmitting,
        selectedPostDetail,
        createMediaErrors,
        error,
    } = useSelector((state: RootState) => state.community);

    const [newPostContent, setNewPostContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

    const filePreviews = useMemo(
        () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [selectedFiles],
    );

    useEffect(() => {
        dispatch(fetchCommunityGroupThunk());
        dispatch(fetchCommunityPostsThunk({ pageNumber: 1, pageSize: PAGE_SIZE }));
    }, [dispatch]);

    useEffect(() => {
        return () => {
            filePreviews.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [filePreviews]);

    const requireLogin = (): boolean => {
        if (user) return true;
        navigate({ to: '/auth' });
        return false;
    };

    const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;
        setSelectedFiles((prev) => [...prev, ...files]);
        event.target.value = '';
    };

    const removeSelectedFile = (target: File) => {
        setSelectedFiles((prev) => prev.filter((file) => file !== target));
    };

    const handleCreatePost = async () => {
        if (!requireLogin()) return;

        try {
            await dispatch(
                createCommunityPostThunk({
                    content: newPostContent,
                    files: selectedFiles,
                }),
            ).unwrap();

            setNewPostContent('');
            setSelectedFiles([]);
            if (pagination.pageNumber !== 1) {
                dispatch(fetchCommunityPostsThunk({ pageNumber: 1, pageSize: pagination.pageSize || PAGE_SIZE }));
            }
        } catch {
            // Error is handled in slice state
        }
    };

    const handleOpenComments = (post: CommunityPostResponse) => {
        const nextId = expandedPostId === post.id ? null : post.id;
        setExpandedPostId(nextId);
        if (nextId) {
            dispatch(fetchCommunityPostDetailThunk(nextId));
        }
    };

    const handleCommentChange = (postId: string, content: string) => {
        setCommentDrafts((prev) => ({
            ...prev,
            [postId]: content,
        }));
    };

    const handleSubmitComment = async (postId: string) => {
        if (!requireLogin()) return;

        const content = (commentDrafts[postId] ?? '').trim();
        if (!content) return;

        try {
            await dispatch(addCommunityCommentThunk({ postId, content })).unwrap();
            setCommentDrafts((prev) => ({
                ...prev,
                [postId]: '',
            }));
        } catch {
            // Error is handled in slice state
        }
    };

    const handlePageChange = (pageNumber: number) => {
        dispatch(fetchCommunityPostsThunk({ pageNumber, pageSize: pagination.pageSize || PAGE_SIZE }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const detailPost = selectedPostDetail && expandedPostId === selectedPostDetail.id ? selectedPostDetail : null;

    return (
        <div className="min-h-screen bg-white font-['Inter']">
            <div
                className="w-full h-36 relative"
                style={{
                    backgroundImage: `url(${bannerImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <MainHeader transparent={true} />
            </div>

            <main className="mx-auto w-full max-w-5xl px-4 py-10">
                <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00008A] text-white">
                            <Users size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#00008A]">
                                {group?.name ?? 'Cộng đồng du lịch'}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {group?.description || 'Chia sẻ trải nghiệm và ảnh đẹp từ các chuyến đi của bạn.'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-[#00008A]">Tạo bài viết mới</h2>
                    <textarea
                        value={newPostContent}
                        onChange={(event) => setNewPostContent(event.target.value)}
                        maxLength={5000}
                        placeholder="Bạn vừa trải nghiệm điều gì thú vị?"
                        className="mt-3 h-28 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                    />
                    <div className="mt-2 text-right text-xs text-gray-500">{newPostContent.length}/5000</div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#00008A] hover:bg-blue-50">
                            <ImagePlus size={16} />
                            Chọn ảnh
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleSelectFiles} />
                        </label>

                        <button
                            type="button"
                            onClick={handleCreatePost}
                            disabled={creatingPost}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#00008A] px-5 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send size={15} />
                            {creatingPost ? 'Đang đăng...' : 'Đăng bài'}
                        </button>

                        {!user && (
                            <span className="text-xs text-amber-700">
                                Cần <Link to="/auth" className="font-bold underline">đăng nhập</Link> để đăng bài và bình luận.
                            </span>
                        )}
                    </div>

                    {filePreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {filePreviews.map((item) => (
                                <div key={`${item.file.name}-${item.file.lastModified}`} className="relative overflow-hidden rounded-xl border border-gray-200">
                                    <img src={item.url} alt={item.file.name} className="h-24 w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedFile(item.file)}
                                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {createMediaErrors.length > 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <p className="font-semibold">Một số ảnh tải lên thất bại:</p>
                            <ul className="mt-1 list-disc pl-4">
                                {createMediaErrors.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() => dispatch(clearCommunityMediaErrors())}
                                className="mt-2 text-xs font-semibold underline"
                            >
                                Đóng
                            </button>
                        </div>
                    )}
                </section>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <div className="flex items-center justify-between gap-4">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => dispatch(clearCommunityError())}
                                className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold hover:bg-red-100"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                <section className="mt-6 space-y-4">
                    {loadingList ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Đang tải bài viết...</div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Chưa có bài viết nào trong cộng đồng.</div>
                    ) : (
                        posts.map((post) => {
                            const isExpanded = expandedPostId === post.id;
                            const comments = isExpanded ? detailPost?.comments ?? [] : [];
                            const isDetailLoading = isExpanded && (!detailPost || detailPost.id !== post.id);

                            return (
                                <article key={post.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <img src={getAvatar(post.userAvatarUrl)} alt={post.userFullName} className="h-11 w-11 rounded-full object-cover border border-gray-200" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900">{post.userFullName}</p>
                                            <p className="text-xs text-gray-500">{formatDateTime(post.createdAt)}</p>
                                        </div>
                                    </div>

                                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{post.content}</p>
                                    {renderPostMedia(post.media)}

                                    <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenComments(post)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50"
                                        >
                                            <MessageCircle size={15} />
                                            {post.commentCount} bình luận
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                            {isDetailLoading ? (
                                                <p className="text-sm text-gray-500">Đang tải bình luận...</p>
                                            ) : comments.length === 0 ? (
                                                <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {comments.map((comment) => (
                                                        <div key={comment.id} className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-xs font-bold text-gray-800">{comment.userFullName}</p>
                                                                <p className="text-[11px] text-gray-500">{formatDateTime(comment.createdAt)}</p>
                                                            </div>
                                                            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-3 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={commentDrafts[post.id] ?? ''}
                                                    maxLength={1000}
                                                    onChange={(event) => handleCommentChange(post.id, event.target.value)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') {
                                                            void handleSubmitComment(post.id);
                                                        }
                                                    }}
                                                    placeholder="Viết bình luận..."
                                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#00008A] focus:ring-2 focus:ring-[#00008A]/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => void handleSubmitComment(post.id)}
                                                    disabled={commentSubmitting}
                                                    className="rounded-lg bg-[#00008A] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Gửi
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })
                    )}
                </section>

                {pagination.totalPages > 1 && (
                    <section className="mt-8 flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => handlePageChange(pagination.pageNumber - 1)}
                            disabled={!pagination.hasPreviousPage}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Trước
                        </button>

                        <span className="rounded-xl bg-[#00008A] px-4 py-2 text-sm font-bold text-white">
                            {pagination.pageNumber}/{pagination.totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => handlePageChange(pagination.pageNumber + 1)}
                            disabled={!pagination.hasNextPage}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Sau
                        </button>
                    </section>
                )}
            </main>

            <Footer />
            <ChatbotWidget />
        </div>
    );
}

