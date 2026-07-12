import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';

const BlogHub = () => {
  const { apiFetch } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const endpoint = selectedCategory === 'All' ? '/articles' : `/articles?category=${selectedCategory}`;
        const data = await apiFetch(endpoint);
        setArticles(data);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Could not load articles at this time.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [selectedCategory]);

  const categories = ['All', 'Trends', 'Sustainability', 'Smart Homes', 'Decor', 'Infrastructure'];

  const featuredArticle = articles[0];
  const gridArticles = articles.slice(1);

  return (
    <div className="container section-padding" style={{ minHeight: '80vh' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <span style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
          Atelier Journal
        </span>
        <h1 className="serif-title" style={{ fontSize: '48px', fontWeight: '400', marginBottom: '16px' }}>
          Insights on Space & Structure
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Curated industry studies on sustainable architectures, interior philosophies, space optimization, and structural engineering trends.
        </p>

        {/* Category Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '36px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--btn-primary-bg)' : 'none',
                color: selectedCategory === cat ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                border: selectedCategory === cat ? '1px solid var(--btn-primary-bg)' : '1px solid transparent',
                borderRadius: '20px',
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'var(--transition-smooth)'
              }}
            >
              {cat === 'Smart Homes' ? 'Smart Integration' : cat}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          Loading editorial collections...
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          No articles published in this category yet. Check back soon!
        </div>
      ) : (
        <div>
          {/* 1. Main Featured Article (Only on 'All' or when articles exist) */}
          {selectedCategory === 'All' && featuredArticle && (
            <section style={{ marginBottom: '64px' }}>
              <div 
                className="card" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 1fr', 
                  gap: 0, 
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {/* Featured Cover Image */}
                <div style={{ minHeight: '380px', position: 'relative' }}>
                  <img 
                    src={featuredArticle.coverImage} 
                    alt={featuredArticle.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'var(--color-gold)', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Featured Article
                  </div>
                </div>

                {/* Featured Bio Content */}
                <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--color-gold)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                    {featuredArticle.category}
                  </span>
                  <h2 className="serif-title" style={{ fontSize: '32px', lineHeight: '1.2', marginBottom: '16px', fontWeight: '400' }}>
                    <Link to={`/blog/${featuredArticle.slug}`} style={{ hoverColor: 'var(--color-gold)' }}>
                      {featuredArticle.title}
                    </Link>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>
                    {featuredArticle.summary}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', fontSize: '12px', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} />
                      <span>{featuredArticle.authorName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>{new Date(featuredArticle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      <span>{featuredArticle.readingTimeMinutes} min read</span>
                    </div>
                  </div>

                  <Link to={`/blog/${featuredArticle.slug}`} className="btn btn-primary" style={{ marginTop: '24px', width: 'fit-content', textTransform: 'uppercase' }}>
                    <span>Read Article</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* 2. Grid Articles */}
          <div className="grid-3">
            {(selectedCategory === 'All' ? gridArticles : articles).map(article => (
              <div key={article._id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Article Cover */}
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }} 
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>

                {/* Article Info */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--color-gold)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                    {article.category}
                  </span>
                  <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '600', lineHeight: '1.3' }}>
                    <Link to={`/blog/${article.slug}`} style={{ hoverColor: 'var(--color-gold)' }}>
                      {article.title}
                    </Link>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5', display: '-webkit-box', webkitLineClamp: '3', webkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.summary}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '11px', color: 'var(--text-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      <span>{article.readingTimeMinutes} min read</span>
                    </div>
                    <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogHub;
