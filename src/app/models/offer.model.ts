export interface Offer {
    showComments: boolean
    id: number
    company: string
    title: string
    description: string
    companyLogo?: string
    followers?: number
    illustration?: string
    likes: number
    comments: number
    shares: number
    isLiked?: boolean
    commentsList?: Comment[]
}

export interface Comment {
    id: number
    author: string
    authorAvatar?: string
    content: string
    timestamp: Date
}
