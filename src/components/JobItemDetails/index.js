import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class JobItemDetails extends Component {
  state = {
    jobData: {},
    similarJobsData: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobData()
  }

  getJobData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }

    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      this.setState({
        jobData: data.job_details,
        similarJobsData: data.similar_jobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderJobDetails = () => {
    const {jobData, similarJobsData, apiStatus} = this.state

    if (apiStatus === apiStatusConstants.inProgress) {
      return (
        <div data-testid="loader" className="loader-container">
          <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
        </div>
      )
    }

    if (apiStatus === apiStatusConstants.failure) {
      return (
        <div className="failure-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
            alt="failure view"
          />
          <h1>Oops! Something Went Wrong</h1>
          <p>We cannot seem to find the page you are looking for</p>
          <button type="button" onClick={this.getJobData}>Retry</button>
        </div>
      )
    }

    return (
      <div className="job-details-success-container">
        <div className="job-details-card">
          <div className="logo-title-container">
            <img src={jobData.company_logo_url} alt="job details company logo" />
            <div>
              <h1>{jobData.title}</h1>
              <p>{jobData.rating}</p>
            </div>
          </div>
          <div className="location-package-container">
            <div>
              <p>{jobData.location}</p>
              <p>{jobData.employment_type}</p>
            </div>
            <p>{jobData.package_per_annum}</p>
          </div>
          <hr />
          <div className="description-visit-container">
            <h1>Description</h1>
            <a href={jobData.company_website_url}>Visit</a>
          </div>
          <p>{jobData.job_description}</p>
          <h1>Skills</h1>
          <ul className="skills-list">
            {jobData.skills &&
              jobData.skills.map(skill => (
                <li key={skill.name}>
                  <img src={skill.image_url} alt={skill.name} />
                  <p>{skill.name}</p>
                </li>
              ))}
          </ul>
          <h1>Life at Company</h1>
          <div className="life-at-company-container">
            <p>{jobData.life_at_company?.description}</p>
            <img
              src={jobData.life_at_company?.image_url}
              alt="life at company"
            />
          </div>
        </div>
        <h1>Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobsData.map(job => (
            <li key={job.id} className="similar-job-item">
              <img src={job.company_logo_url} alt="similar job company logo" />
              <h1>{job.title}</h1>
              <p>{job.rating}</p>
              <h1>Description</h1>
              <p>{job.job_description}</p>
              <p>{job.location}</p>
              <p>{job.employment_type}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  render() {
    return (
      <>
        <Header />
        <div className="job-item-details-container">
          {this.renderJobDetails()}
        </div>
      </>
    )
  }
}

export default JobItemDetails