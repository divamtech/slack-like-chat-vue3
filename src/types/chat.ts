export interface DirectMessage {
  id: string
  name: string
  avatar: string
  online: boolean
}

export interface Message {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
  attachments?: Attachment[]
  comments?: Message[]
  reactions?: Reaction[]
  online?: boolean
}

export interface Comment {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
}

export interface Reaction {
  emoji: string
  count: number
  users: string[]
}

export interface Suggestion {
  type: 'user' | 'channel'
  text: string
}

export interface Attachment {
  name: string
  file: File
  preview?: string
  type: 'image' | 'document'
}

export interface MessageGroup {
  date: string
  messages: Message[]
}
