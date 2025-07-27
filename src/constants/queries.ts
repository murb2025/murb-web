export const GET_BLOGS_QUERY = `
  query GetArticles($host:String!,$page:Int!){
    publication(host:$host){
    postsViaPage(pageSize:10,page:$page){
      nodes{
        id
        slug
        title
        tags{
          id
          slug
          name
        }
        brief
        coverImage{
          url
        }
        readTimeInMinutes
        publishedAt
      }
      pageInfo{
        hasNextPage
        nextPage
      }
      totalDocuments
    }
  }
}
`;

export const GET_BLOGS_BY_TAG = `
query GetArticlesByTag($host:String!,$tag:String!,$page:Int!){
  publication(host:$host){
    postsViaPage(pageSize:10,page:$page,filter:{tagSlugs:[$tag]}){
      nodes{
        id
        slug
        title
        tags{
          id
          slug
          name
        }
        brief
        coverImage{
          url
        }
        readTimeInMinutes
        publishedAt
      }
      pageInfo{
        hasNextPage
        nextPage
      }
      totalDocuments
    }
  }
}
`;

export const GET_BLOG_BY_SLUG = `
query GetArticlesBySlug($host:String!,$slug:String!)  {
  publication(host:$host){
  	post(slug:$slug){
      id
      slug
      title
      author{
        name
        profilePicture
      }
      tags{
        id
        slug
        name
      }
      coverImage{
        url
      }
      readTimeInMinutes
      hasLatexInPost
      publishedAt
      content{
        html
      }
    }
  }
}
`;

export const SUBSCRIBE_MUTATION = `
mutation Subscribe($email:String!,$id:ObjectId!){
  subscribeToNewsletter(input:{
    publicationId: $id,
    email: $email
  }){
    status
  }
}
`;

export const GET_BLOGMETADATA = `
query GetBlogMetadata($host:String!,$slug:String!){
  publication(host: $host) {
    post(slug: $slug) {
      title
      brief
      tags{
        name
      }
      coverImage{
        url
      }
    }
  }
}
`;

export const GET_SLUGS = `
  query GetSlugs($host:String!,$page:Int!){
  publication(host: $host) {
    postsViaPage(pageSize:20,page:$page){
      nodes{
        slug
        updatedAt
        publishedAt
      }
      pageInfo{
        hasNextPage
      }
    }
  }
  }
`;
