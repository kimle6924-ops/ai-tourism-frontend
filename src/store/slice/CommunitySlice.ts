import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaginatedResponse } from '../../services/AdminPlaceService';
import CommunityService, {
    type CommunityCommentResponse,
    type CommunityGroupResponse,
    type CommunityPostResponse,
} from '../../services/CommunityService';

interface CommunityPaginationState {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface CreatePostResult {
    post: CommunityPostResponse;
    mediaErrors: string[];
}

interface CommunityState {
    group: CommunityGroupResponse | null;
    posts: CommunityPostResponse[];
    pagination: CommunityPaginationState;
    loadingList: boolean;
    creatingPost: boolean;
    uploadingMedia: boolean;
    commentSubmitting: boolean;
    selectedPostDetail: CommunityPostResponse | null;
    createMediaErrors: string[];
    error: string | null;
}

const initialState: CommunityState = {
    group: null,
    posts: [],
    pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    },
    loadingList: false,
    creatingPost: false,
    uploadingMedia: false,
    commentSubmitting: false,
    selectedPostDetail: null,
    createMediaErrors: [],
    error: null,
};

const extractErrorMessage = (err: unknown, fallback: string): string => {
    return (
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err as { message?: string })?.message ??
        fallback
    );
};

export const fetchCommunityGroupThunk = createAsyncThunk<CommunityGroupResponse, void, { rejectValue: string }>(
    'community/fetchGroup',
    async (_, { rejectWithValue }) => {
        try {
            const res = await CommunityService.getPublicGroup();
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải nhóm cộng đồng');
            return res.data;
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err, 'Không thể tải nhóm cộng đồng'));
        }
    },
);

export const fetchCommunityPostsThunk = createAsyncThunk<PaginatedResponse<CommunityPostResponse>, { pageNumber: number; pageSize: number }, { rejectValue: string }>(
    'community/fetchPosts',
    async ({ pageNumber, pageSize }, { rejectWithValue }) => {
        try {
            const res = await CommunityService.getPublicPosts(pageNumber, pageSize);
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải danh sách bài viết');
            return res.data;
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err, 'Không thể tải danh sách bài viết'));
        }
    },
);

export const fetchCommunityPostDetailThunk = createAsyncThunk<CommunityPostResponse, string, { rejectValue: string }>(
    'community/fetchPostDetail',
    async (postId, { rejectWithValue }) => {
        try {
            const res = await CommunityService.getPostById(postId);
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể tải chi tiết bài viết');
            return res.data;
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err, 'Không thể tải chi tiết bài viết'));
        }
    },
);

export const createCommunityPostThunk = createAsyncThunk<CreatePostResult, { content: string; files: File[] }, { rejectValue: string }>(
    'community/createPost',
    async ({ content, files }, { rejectWithValue }) => {
        const normalizedContent = content.trim();
        if (!normalizedContent) {
            return rejectWithValue('Nội dung bài viết không được để trống');
        }
        if (normalizedContent.length > 5000) {
            return rejectWithValue('Nội dung bài viết vượt quá 5000 ký tự');
        }

        try {
            const createRes = await CommunityService.createPublicPost(normalizedContent);
            if (!createRes.success) return rejectWithValue(createRes.error ?? 'Không thể tạo bài viết');

            const postId = createRes.data.id;
            const mediaErrors: string[] = [];

            for (const file of files) {
                try {
                    const signatureRes = await CommunityService.getPostUploadSignature(postId);
                    if (!signatureRes.success) {
                        mediaErrors.push(`${file.name}: ${signatureRes.error ?? 'Lỗi lấy chữ ký upload'}`);
                        continue;
                    }

                    const cloudinaryRes = await CommunityService.uploadToCloudinary(file, signatureRes.data);
                    if (cloudinaryRes.error) {
                        mediaErrors.push(`${file.name}: ${cloudinaryRes.error.message ?? 'Lỗi upload Cloudinary'}`);
                        continue;
                    }

                    const finalizeRes = await CommunityService.finalizePostMedia({
                        postId,
                        publicId: cloudinaryRes.public_id,
                        url: cloudinaryRes.url,
                        secureUrl: cloudinaryRes.secure_url,
                        format: cloudinaryRes.format,
                        mimeType: file.type || `image/${cloudinaryRes.format}`,
                        bytes: cloudinaryRes.bytes,
                        width: cloudinaryRes.width,
                        height: cloudinaryRes.height,
                    });

                    if (!finalizeRes.success) {
                        mediaErrors.push(`${file.name}: ${finalizeRes.error ?? 'Lỗi lưu metadata ảnh'}`);
                    }
                } catch (uploadError) {
                    mediaErrors.push(`${file.name}: ${extractErrorMessage(uploadError, 'Lỗi upload ảnh')}`);
                }
            }

            const detailRes = await CommunityService.getPostById(postId);
            if (detailRes.success) {
                return {
                    post: detailRes.data,
                    mediaErrors,
                };
            }

            return {
                post: createRes.data,
                mediaErrors,
            };
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err, 'Không thể tạo bài viết'));
        }
    },
);

export const addCommunityCommentThunk = createAsyncThunk<CommunityCommentResponse, { postId: string; content: string }, { rejectValue: string }>(
    'community/addComment',
    async ({ postId, content }, { rejectWithValue }) => {
        const normalizedContent = content.trim();
        if (!normalizedContent) {
            return rejectWithValue('Nội dung bình luận không được để trống');
        }
        if (normalizedContent.length > 1000) {
            return rejectWithValue('Nội dung bình luận vượt quá 1000 ký tự');
        }

        try {
            const res = await CommunityService.addComment(postId, normalizedContent);
            if (!res.success) return rejectWithValue(res.error ?? 'Không thể gửi bình luận');
            return res.data;
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err, 'Không thể gửi bình luận'));
        }
    },
);

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        clearCommunityError(state) {
            state.error = null;
        },
        clearCommunityMediaErrors(state) {
            state.createMediaErrors = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCommunityGroupThunk.fulfilled, (state, action: PayloadAction<CommunityGroupResponse>) => {
                state.group = action.payload;
            })
            .addCase(fetchCommunityGroupThunk.rejected, (state, action) => {
                state.error = action.payload ?? 'Không thể tải nhóm cộng đồng';
            })

            .addCase(fetchCommunityPostsThunk.pending, (state) => {
                state.loadingList = true;
                state.error = null;
            })
            .addCase(fetchCommunityPostsThunk.fulfilled, (state, action: PayloadAction<PaginatedResponse<CommunityPostResponse>>) => {
                state.loadingList = false;
                state.posts = action.payload.items;
                state.pagination = {
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalPages: action.payload.totalPages,
                    totalCount: action.payload.totalCount,
                    hasNextPage: action.payload.hasNextPage,
                    hasPreviousPage: action.payload.hasPreviousPage,
                };
            })
            .addCase(fetchCommunityPostsThunk.rejected, (state, action) => {
                state.loadingList = false;
                state.error = action.payload ?? 'Không thể tải danh sách bài viết';
            })

            .addCase(fetchCommunityPostDetailThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchCommunityPostDetailThunk.fulfilled, (state, action: PayloadAction<CommunityPostResponse>) => {
                state.selectedPostDetail = action.payload;
                state.posts = state.posts.map((post) => (post.id === action.payload.id ? action.payload : post));
            })
            .addCase(fetchCommunityPostDetailThunk.rejected, (state, action) => {
                state.error = action.payload ?? 'Không thể tải chi tiết bài viết';
            })

            .addCase(createCommunityPostThunk.pending, (state) => {
                state.creatingPost = true;
                state.uploadingMedia = true;
                state.error = null;
                state.createMediaErrors = [];
            })
            .addCase(createCommunityPostThunk.fulfilled, (state, action: PayloadAction<CreatePostResult>) => {
                state.creatingPost = false;
                state.uploadingMedia = false;
                state.createMediaErrors = action.payload.mediaErrors;
                state.posts = [action.payload.post, ...state.posts];
                state.pagination.totalCount += 1;
                state.pagination.hasNextPage = state.pagination.totalPages > state.pagination.pageNumber;
                if (state.posts.length > state.pagination.pageSize) {
                    state.posts = state.posts.slice(0, state.pagination.pageSize);
                }
            })
            .addCase(createCommunityPostThunk.rejected, (state, action) => {
                state.creatingPost = false;
                state.uploadingMedia = false;
                state.error = action.payload ?? 'Không thể tạo bài viết';
            })

            .addCase(addCommunityCommentThunk.pending, (state) => {
                state.commentSubmitting = true;
                state.error = null;
            })
            .addCase(addCommunityCommentThunk.fulfilled, (state, action: PayloadAction<CommunityCommentResponse>) => {
                state.commentSubmitting = false;

                const postInList = state.posts.find((post) => post.id === action.payload.postId);
                if (postInList) {
                    postInList.commentCount += 1;
                }

                if (state.selectedPostDetail && state.selectedPostDetail.id === action.payload.postId) {
                    state.selectedPostDetail.comments = [...state.selectedPostDetail.comments, action.payload];
                    state.selectedPostDetail.commentCount += 1;
                }
            })
            .addCase(addCommunityCommentThunk.rejected, (state, action) => {
                state.commentSubmitting = false;
                state.error = action.payload ?? 'Không thể gửi bình luận';
            });
    },
});

export const { clearCommunityError, clearCommunityMediaErrors } = communitySlice.actions;
export default communitySlice.reducer;
