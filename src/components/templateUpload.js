import React, { Component } from 'react'
import axios from 'axios'

const endpoint = `${process.env.REACT_APP_URL}/upload`
class TemplateUpload extends Component {
  handleFileChange = (event) => {
    this.setState({
      selectedFile: event.target.files[0]
    })
  }
  handleUpload = (event) => {
    event.preventDefault()
    const data = new FormData()
    data.append('file', this.state.selectedFile, this.state.selectedFile.name)
    axios.post(endpoint, data).then((res) => {
      console.log(res.statusText)
    })
  }
  render() {
    return (
      <form className="App" onSubmit={this.handleUpload}>
        <input type="file" name="file" onChange={this.handleFileChange} />
        <button onClick={this.handleUpload}>Save Your Template</button>
      </form>
    )
  }
}
export default TemplateUpload
