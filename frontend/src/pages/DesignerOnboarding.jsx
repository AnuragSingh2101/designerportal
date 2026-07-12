import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Sparkles, FolderPlus, ArrowLeft, ArrowRight, Save, ShieldAlert } from 'lucide-react';

const DesignerOnboarding = () => {
  const { user, designerProfileId, apiFetch, updateProfileId } = useAuth();
  const navigate = useNavigate();

  // Wizard Step
  const [step, setStep] = useState(1);

  // Form states
  const [expertise, setExpertise] = useState({
    architecture: false,
    interior_design: false
  });
  const [experienceYears, setExperienceYears] = useState(1);
  const [location, setLocation] = useState('');
  const [budgetMin, setBudgetMin] = useState(5000);
  const [budgetMax, setBudgetMax] = useState(50000);
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Initial Project states
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('Residential');
  const [projectStyle, setProjectStyle] = useState('Modern');
  const [projectImagesStr, setProjectImagesStr] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Error/Loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing profile details if they already exist (e.g. if they are editing)
  useEffect(() => {
    const loadProfile = async () => {
      if (designerProfileId) {
        try {
          const data = await apiFetch(`/designers/${designerProfileId}`);
          setExpertise({
            architecture: data.expertise.includes('architecture'),
            interior_design: data.expertise.includes('interior_design')
          });
          setExperienceYears(data.experienceYears);
          setLocation(data.location);
          setBudgetMin(data.budgetMin);
          setBudgetMax(data.budgetMax);
          setBio(data.bio);
          setProfilePhotoUrl(data.profilePhotoUrl);
          setLicenseType(data.licenseType || '');
          setLicenseNumber(data.licenseNumber || '');
        } catch (err) {
          console.error('Error loading designer details:', err);
        }
      }
    };
    loadProfile();
  }, [designerProfileId]);

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!expertise.architecture && !expertise.interior_design) {
        setError('Please select at least one core area of expertise.');
        return;
      }
      if (!location) {
        setError('Please specify your studio location city.');
        return;
      }
      if (Number(budgetMin) > Number(budgetMax)) {
        setError('Minimum budget cannot exceed maximum budget.');
        return;
      }
    }

    if (step === 2) {
      if (!bio || bio.length < 20) {
        setError('Please write a biography describing your design philosophy (min 20 characters).');
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const selectedExpertiseArray = [];
    if (expertise.architecture) selectedExpertiseArray.push('architecture');
    if (expertise.interior_design) selectedExpertiseArray.push('interior_design');

    try {
      // 1. Check if we need to find or verify the profileId
      let targetProfileId = designerProfileId;
      
      if (!targetProfileId) {
        // Fallback safety check: fetch profile if it exists for user
        const profiles = await apiFetch('/designers');
        const myProfile = profiles.find(p => p.userId?._id === user.id);
        if (myProfile) {
          targetProfileId = myProfile._id;
          updateProfileId(myProfile._id);
        }
      }

      if (!targetProfileId) {
        throw new Error('Designer Profile document not found. Please re-login.');
      }

      // 2. Put profile updates
      const updatedProfile = await apiFetch(`/designers/${targetProfileId}`, {
        method: 'PUT',
        body: JSON.stringify({
          expertise: selectedExpertiseArray,
          experienceYears: Number(experienceYears),
          location,
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax),
          bio,
          profilePhotoUrl: profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
          licenseType,
          licenseNumber
        })
      });

      // 3. Optional: Create initial portfolio project if filled out in step 3
      if (projectTitle && projectDesc && projectImagesStr) {
        const imagesArray = projectImagesStr
          .split(',')
          .map(url => url.trim())
          .filter(url => url.length > 0);

        if (imagesArray.length > 0) {
          await apiFetch('/portfolio', {
            method: 'POST',
            body: JSON.stringify({
              title: projectTitle,
              description: projectDesc,
              category: projectCategory,
              style: projectStyle,
              images: imagesArray
            })
          });
        }
      }

      // Sync and Redirect
      navigate('/designer-dashboard');

    } catch (err) {
      console.error('Onboarding submit error:', err);
      setError(err.message || 'Could not update designer profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--navbar-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '40px' }}>
        
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <span style={{ color: 'var(--color-gold)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Step {step} of 3
            </span>
            <h2 className="serif-title" style={{ fontSize: '22px', marginTop: '4px' }}>
              {step === 1 && 'Professional Details'}
              {step === 2 && 'Studio Identity'}
              {step === 3 && 'First Project Showcase'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '24px', height: '6px', backgroundColor: step >= 1 ? 'var(--color-gold)' : 'var(--border-color)', borderRadius: '3px' }} />
            <div style={{ width: '24px', height: '6px', backgroundColor: step >= 2 ? 'var(--color-gold)' : 'var(--border-color)', borderRadius: '3px' }} />
            <div style={{ width: '24px', height: '6px', backgroundColor: step >= 3 ? 'var(--color-gold)' : 'var(--border-color)', borderRadius: '3px' }} />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <span className="form-label">Core Specialization</span>
              <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={expertise.architecture}
                    onChange={() => setExpertise(p => ({ ...p, architecture: !p.architecture }))}
                    style={{ accentColor: 'var(--color-gold)', width: '18px', height: '18px' }}
                  />
                  <span>Architecture</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={expertise.interior_design}
                    onChange={() => setExpertise(p => ({ ...p, interior_design: !p.interior_design }))}
                    style={{ accentColor: 'var(--color-gold)', width: '18px', height: '18px' }}
                  />
                  <span>Interior Design</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="form-input"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Studio City (e.g. Austin, TX)</label>
                <input
                  type="text"
                  placeholder="San Francisco, CA"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Minimum Project Budget Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Maximum Project Budget Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Accreditation Type (e.g. AIA, NCIDQ)</label>
                <input
                  type="text"
                  placeholder="e.g. AIA"
                  className="form-input"
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Accreditation License # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AIA-98310"
                  className="form-input"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignSelf: 'flex-end', marginTop: '12px' }}>
              <span>Next details</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* STEP 2: About Me (Bio, Photo) */}
        {step === 2 && (
          <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Profile Photo URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                className="form-input"
                value={profilePhotoUrl}
                onChange={(e) => setProfilePhotoUrl(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                Leave empty for a default professional avatar profile placeholder.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Studio Philosophy & Biography</label>
              <textarea
                placeholder="Share your architectural style focus, project management workflow, preferred materials..."
                className="form-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button type="button" onClick={handlePrevStep} className="btn btn-secondary" style={{ display: 'flex', gap: '6px' }}>
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '6px' }}>
                <span>Review Gallery</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Initial Project Upload */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span className="designeronboarding-style-1" style={{border: '1px solid var(--color-gold)'}}>
              Optional: Add details of your first portfolio design project to launch your public page immediately. You can skip this step and add projects in your dashboard later.
            </span>

            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Glass Cliff Pavilion"
                className="form-input"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Project Category</label>
                <select
                  className="form-input"
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  disabled={loading}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Landscape">Landscape</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Design Style</label>
                <input
                  type="text"
                  placeholder="e.g. Scandinavian, Mid-Century Modern"
                  className="form-input"
                  value={projectStyle}
                  onChange={(e) => setProjectStyle(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Image URLs (comma-separated)</label>
              <textarea
                className="form-input"
                placeholder="e.g. https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2"
                value={projectImagesStr}
                onChange={(e) => setProjectImagesStr(e.target.value)}
                disabled={loading}
                style={{ minHeight: '80px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Scope & Material Description</label>
              <textarea
                placeholder="Explain the project outline, structural design choices, and custom finishes..."
                className="form-input"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button type="button" onClick={handlePrevStep} className="btn btn-secondary" disabled={loading} style={{ display: 'flex', gap: '6px' }}>
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              
              <button type="submit" className="btn btn-accent" disabled={loading} style={{ display: 'flex', gap: '6px' }}>
                <Save size={14} />
                <span>{loading ? 'Submitting...' : 'Complete Studio Setup'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default DesignerOnboarding;
