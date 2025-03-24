export interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  reactions?: Reaction[]
  attachments?: MessageAttachment[]
}

export interface Reaction {
  emoji: string
  users: string[]
  count: number
}

export interface MessageAttachment {
  name: string
  type: 'image' | 'document'
  preview?: string
  file?: File
}

export interface DirectMessage {
  id: string
  name: string
  avatar: string
  online: boolean
}
