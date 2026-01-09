import React, { useState, useEffect } from 'react';

const RecentJobPosts = () => {
  const [jobPosts, setJobPosts] = useState([]);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/employer/recent-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setJobPosts(data.jobs || []);
      }
    } catch (error) {
      
    }
  };
  return (
    <div className="col-lg-12 col-md-12 mb-4">
      <div className="panel panel-default">
        <div className="panel-heading wt-panel-heading p-a20">
          <h4 className="panel-tittle m-a0">Recent Job Posts</h4>
          <p className="text-muted">Your latest job postings</p>
        </div>
        <div className="panel-body wt-panel-body bg-white">
          {jobPosts.length === 0 && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {jobPosts.length > 0 ? jobPosts.map((job, index) => (
            <div
              key={job._id || index}
              className="d-flex justify-content-between align-items-center border rounded p-3 mb-3"
            >
              <div>
                <h5 className="mb-1">{job.title}</h5>
                <p className="mb-0 text-muted">
                  {job.applicationCount || 0} applications &bull; Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span
                  className={`badge ${
                    job.status === 'active' ? 'bg-dark text-white' : 'bg-light text-muted border'
                  } p-2`}
                  style={{ textTransform: 'uppercase', fontSize: '12px' }}
                >
                  {job.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center text-muted p-4">
              <p>No recent job posts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentJobPosts;
