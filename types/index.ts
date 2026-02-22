// 博客数据类型定义

export interface Post {
  id: string
  title: string
  slug: string
  summary: string
  cover: string | null
  tags: string[]
  category: string | null
  published: boolean
  date: string | null
}

export interface AboutInfo {
  name: string
  avatar: string | null
  bio: string
  bioExtended: string
  email: string
  github: string
  leetcode: string
  qq: string
}
