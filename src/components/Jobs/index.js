import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import {Link} from 'react-router-dom'
import Header from '../Header'
import './index.css'

const employmentTypesList = [
  {label: 'Full Time', employmentTypeId: 'FULLTIME'},
  {label: 'Part Time', employmentTypeId: 'PARTTIME'},
  {label: 'Freelance', employmentTypeId: 'FREELANCE'},
  {label: 'Internship', employmentTypeId: 'INTERNSHIP'},
]

const salaryRangesList = [
  {salaryRangeId: '1000000', label: '10 LPA and above'},
  {salaryRangeId: '2000000', label: '20 LPA and above'},
  {salaryRangeId: '3000000', label: '30 LPA and above'},
  {salaryRangeId: '4000000', label: '40 LPA and above'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    profileData: {},
    jobsList: [],
    profileApiStatus: apiStatusConstants.initial,
    jobsApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activeEmploymentTypes: [],
    activeSalaryRange: '',
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobsList()
  }

  getProfileDetails = async () => {
    this.setState({profileApiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      const profileData = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({profileData, profileApiStatus: apiStatusConstants.success})
    } else {
      this.setState({profileApiStatus: apiStatusConstants.failure})
    }
  }

  getJobsList = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})
    const {activeEmploymentTypes, activeSalaryRange, searchInput} = this.state
    const employmentTypeStr = activeEmploymentTypes.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeStr}&minimum_package=${activeSalaryRange}&search=${searchInput}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      this.setState({
        jobsList: data.jobs,
        jobsApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({jobsApiStatus: apiStatusConstants.failure})
    }
  }

  onChangeSearchInput = event =>
    this.setState({searchInput: event.target.value})

  onEnterSearchInput = event => {
    if (event.key === 'Enter') this.getJobsList()
  }

  onClickSearchBtn = () => this.getJobsList()

  onChangeEmploymentType = event => {
    const {activeEmploymentTypes} = this.state
    if (event.target.checked) {
      this.setState(
        {activeEmploymentTypes: [...activeEmploymentTypes, event.target.id]},
        this.getJobsList,
      )
    } else {
      this.setState(
        {
          activeEmploymentTypes: activeEmploymentTypes.filter(
            each => each !== event.target.id,
          ),
        },
        this.getJobsList,
      )
    }
  }

  onChangeSalaryRange = event => {
    this.setState({activeSalaryRange: event.target.id}, this.getJobsList)
  }

  renderProfile = () => {
    const {profileData, profileApiStatus} = this.state
    if (profileApiStatus === apiStatusConstants.success) {
      return (
        <div className="profile-container">
          <img src={profileData.profileImageUrl} alt="profile" />
          <h1 className="profile-name">{profileData.name}</h1>
          <p className="profile-bio">{profileData.shortBio}</p>
        </div>
      )
    }
    if (profileApiStatus === apiStatusConstants.failure) {
      return (
        <button type="button" onClick={this.getProfileDetails}>
          Retry
        </button>
      )
    }
    return (
      <div data-testid="loader" className="loader-container">
        <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
      </div>
    )
  }

  renderJobsList = () => {
    const {jobsList, jobsApiStatus} = this.state
    if (jobsApiStatus === apiStatusConstants.inProgress) {
      return (
        <div data-testid="loader" className="loader-container">
          <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
        </div>
      )
    }
    if (jobsApiStatus === apiStatusConstants.failure) {
      return (
        <div className="failure-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
            alt="failure view"
          />
          <h1>Oops! Something Went Wrong</h1>
          <p>We cannot seem to find the page you are looking for</p>
          <button type="button" onClick={this.getJobsList}>
            Retry
          </button>
        </div>
      )
    }
    if (jobsList.length === 0) {
      return (
        <div className="no-jobs-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
          />
          <h1>No Jobs Found</h1>
          <p>We could not find any jobs. Try other filters</p>
        </div>
      )
    }
    return (
      <ul className="jobs-list">
        {jobsList.map(job => (
          <li key={job.id} className="job-item">
            <Link to={`/jobs/${job.id}`} className="job-link">
              <div className="company-logo-container">
                <img src={job.company_logo_url} alt="company logo" />
                <div>
                  <h1 className="job-title">{job.title}</h1>
                  <p className="job-rating">{job.rating}</p>
                </div>
              </div>
              <div className="location-type-salary-container">
                <div>
                  <p>{job.location}</p>
                  <p>{job.employment_type}</p>
                </div>
                <p>{job.package_per_annum}</p>
              </div>
              <hr />
              <h1 className="description-heading">Description</h1>
              <p>{job.job_description}</p>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  render() {
    const {searchInput} = this.state
    return (
      <>
        <Header />
        <div className="jobs-route-container">
          <div className="side-bar">
            {this.renderProfile()}
            <hr />
            <h1 className="filter-heading">Type of Employment</h1>
            <ul className="filters-list">
              {employmentTypesList.map(type => (
                <li key={type.employmentTypeId}>
                  <input
                    type="checkbox"
                    id={type.employmentTypeId}
                    onChange={this.onChangeEmploymentType}
                  />
                  <label htmlFor={type.employmentTypeId}>{type.label}</label>
                </li>
              ))}
            </ul>
            <hr />
            <h1 className="filter-heading">Salary Range</h1>
            <ul className="filters-list">
              {salaryRangesList.map(range => (
                <li key={range.salaryRangeId}>
                  <input
                    type="radio"
                    id={range.salaryRangeId}
                    name="salary"
                    onChange={this.onChangeSalaryRange}
                  />
                  <label htmlFor={range.salaryRangeId}>{range.label}</label>
                </li>
              ))}
            </ul>
          </div>
          <div className="jobs-container">
            <div className="search-container">
              <input
                type="search"
                value={searchInput}
                placeholder="Search"
                onChange={this.onChangeSearchInput}
                onKeyDown={this.onEnterSearchInput}
              />
              <button
                type="button"
                data-testid="searchButton"
                onClick={this.onClickSearchBtn}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.renderJobsList()}
          </div>
        </div>
      </>
    )
  }
}

export default Jobs
