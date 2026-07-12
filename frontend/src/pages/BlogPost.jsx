import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, Calendar, User, Share2 } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const { apiFetch } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/articles/${slug}`);
        setArticle(data);
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError('Article not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  // Clean, zero-dependency helper to format simple markdown strings into JSX
  const parseInlineMarkdown = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: '600', margin: '28px 0 12px', color: 'var(--text-primary)' }}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '26px', fontWeight: '400', margin: '36px 0 16px', color: 'var(--text-primary)' }}>
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '24px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '15px' }}>
            {parseInlineMarkdown(line.substring(2))}
          </li>
        );
      }
      if (line.startsWith('1. ')) {
        return (
          <li key={idx} style={{ marginLeft: '24px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '15px', listStyleType: 'decimal' }}>
            {parseInlineMarkdown(line.substring(3))}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} style={{ height: '14px' }} />;
      }
      return (
        <p key={idx} style={{ marginBottom: '20px', lineHeight: '1.75', fontSize: '15px', color: 'var(--text-secondary)' }}>
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', color: 'var(--text-light)' }}>
        Loading editorial content...
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {error || 'The requested article could not be located.'}
        </div>
        <Link to="/blog" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Journal</Link>
      </div>
    );
  }

  return (
    <article className="container section-padding" style={{ maxWidth: '800px' }}>
      
      {/* Back Button */}
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: 'var(--color-gold)', marginBottom: '32px' }}>
        <ArrowLeft size={16} />
        <span>Back to Journal</span>
      </Link>

      {/* Meta Header */}
      <header style={{ marginBottom: '36px' }}>
        <span style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
          {article.category}
        </span>
        <h1 className="serif-title" style={{ fontSize: '42px', lineHeight: '1.2', fontWeight: '400', color: 'var(--text-primary)' }}>
          {article.title}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: '300', margin: '16px 0 24px', lineHeight: '1.5' }}>
          {article.summary}
        </p>

        {/* Author details and actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} style={{ color: 'var(--color-gold)' }} />
              <span>By <strong>{article.authorName}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>{article.readingTimeMinutes} Min Read</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
          >
            <Share2 size={14} />
            <span>Copy Link</span>
          </button>
        </div>
      </header>

      {/* Large Featured Image */}
      <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
        <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Article Markdown Body */}
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '16px' }}>
        {renderMarkdown(article.content)}
      </div>

      {/* Tags Footer */}
      {article.tags && article.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          {article.tags.map(tag => (
            <span 
              key={tag} 
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default BlogPost;
