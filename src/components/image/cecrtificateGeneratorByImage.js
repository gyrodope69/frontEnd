import {
  Divider,
  Drawer,
  Fab,
  makeStyles,
  TextField,
  Typography
} from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CloseIcon from '@material-ui/icons/Close'
import EditIcon from '@material-ui/icons/Edit'
import clsx from 'clsx'
import jsPDF from 'jspdf'
import React, { useEffect, useRef, useState } from 'react'
import { drawerWidth } from '../../constants'
import ButtonComponent from '../Button'
import templates from '../../data'
import axios from 'axios'
import FileDownload from 'js-file-download'

const useStyles = makeStyles((theme) => ({
  root: {
    // textAlign: 'center',
    padding: theme.spacing(3),
    marginTop: theme.spacing(5)
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    backgroundColor: 'grey'
  },
  drawerPaper: {
    width: drawerWidth
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(5),
    right: theme.spacing(5)
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    // margin: theme.spacing(30, 1, 0),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
    cursor: 'pointer'
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginRight: drawerWidth
  },
  textField: {
    margin: '20px 4px 0px',
    backgroundColor: '#f7f7f7',
    width: '120px'
  },
  btn: {
    margin: theme.spacing(2, 2, 0),
    padding: theme.spacing(1.5, 2)
  }
}))

function CertificateGeneratorByImage({ data }) {
  const classes = useStyles()
  const canvas = useRef()
  let ctx = null

  const [textDrawProperties, setTextDrawProperties] = useState(
    templates.png[0].text
  )
  const [open, setOpen] = React.useState(false)
  const [state, forceUpdate] = useState(false)

  useEffect(() => {
    setTextDrawProperties(modifyield(textDrawProperties, data[0]))
  }, [])

  useEffect(() => {
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current
    var imageObj1 = new Image()
    imageObj1.src = 'template/t1.png'
    imageObj1.onload = function () {
      canvasEle.width = imageObj1.width
      canvasEle.height = imageObj1.height
    }
    // get context of the canvas
    ctx = canvasEle.getContext('2d')
  }, [])

  useEffect(() => {
    updateCanvas()
  })

  function downloadImage(uri, name) {
    var link = document.createElement('a')
    link.download = name
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function downloadPdf(uri, name) {
    const pdf = new jsPDF({ orientation: 'landscape' })
    const imgProps = pdf.getImageProperties(uri)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(uri, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${name}.pdf`)
  }

  console.log(data)

  function updateCanvas() {
    // var {x, y} = cordinates
    const canvasEle = canvas.current
    ctx = canvasEle.getContext('2d')
    var imageObj1 = new Image()
    imageObj1.src = 'template/t1.png'
    imageObj1.onload = function () {
      ctx.drawImage(imageObj1, 0, 0)
      textDrawProperties.map((text, index) => {
        ctx.font = `bold ${text.size}pt Montserrat`
        ctx.fillStyle = 'black'
        ctx.fillText(data[1][index]?.title, text.x, text.y)
      })
      forceUpdate(true)
    }
  }

  const handleChange = (index) => (e) => {
    let newArray = [...textDrawProperties]
    newArray[index][e.target.name] = e.target.value
    setTextDrawProperties(newArray)
  }

  const resetToDefault = () => {
    window.location.reload()
  }

  const addField = () => {
    setTextDrawProperties([
      ...textDrawProperties,
      {
        title: 'Title',
        x: Math.floor(Math.random() * 100) + 80,
        y: Math.floor(Math.random() * 100) + 80,
        size: 50
      }
    ])
  }

  const removeField = (index) => {
    let arr = [...textDrawProperties]
    arr.splice(index, 1)
    setTextDrawProperties(arr)
  }

  function sendReq() {
    axios({
      url: `${process.env.REACT_APP_URL}/cert`,
      method: 'POST',
      data: {
        template: 't1.png',
        textProps: [...textDrawProperties],
        csv: [...data]
      },
      responseType: 'blob'
    })
      .then((res) => {
        FileDownload(res.data, 'Certiificates-' + Date.now() + '.zip')
      })
      .catch((e) => {
        console.log(e)
      })
  }
  function certificateDownload() {
    axios({
      url: `${process.env.REACT_APP_URL}/downloads`,
      method: 'POST',
      data: {
        template: 't1.png',
        textProps: [...textDrawProperties],
        csv: [...data]
      },
      responseType: 'blob'
    }).then((res) => {
      FileDownload(res.data, 'MergedCertificate-' + Date.now() + '.zip')
    })
  }

  // function mergedCertificateDownload() {
  //   axios({
  //     url: 'http://localhost:5001/mergedownload',
  //     method: 'POST',
  //     responseType: 'blob'
  //   })
  //     .then((res) => {
  //       FileDownload(res.data, 'MergedCertificates-' + Date.now() + '.pdf')
  //     })
  //     .catch((e) => {
  //       console.log(e)
  //     })
  // }

  return (
    <div
      className={clsx(classes.root, {
        [classes.appBarShift]: open
      })}
    >
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <ul>
          {textDrawProperties.map((properties, index) => (
            <li key={index}>
              <div style={{ display: 'block', marginTop: '20px' }}>
                {/* <TextField
                  name="title"
                  value={properties.title}
                  onChange={handleChange(index)}
                /> */}
                <Typography
                  style={{ display: 'inline-block', marginRight: '26px' }}
                >
                  {properties.title}
                </Typography>
                <Fab
                  variant="extended"
                  size="small"
                  style={{
                    position: 'absolute',
                    backgroundColor: 'red',
                    color: 'white'
                  }}
                  onClick={() => removeField(index)}
                >
                  {/* <RemoveIcon /> */}
                  <Typography variant="caption" style={{ fontWeight: 600 }}>
                    Delete
                  </Typography>
                </Fab>
              </div>
              <TextField
                className={classes.textField}
                value={properties.x}
                name="x"
                id="outlined-numberX"
                label="X"
                type="number"
                onChange={handleChange(index)}
                InputLabelProps={{
                  shrink: true
                }}
                variant="outlined"
              />
              <TextField
                className={classes.textField}
                id="outlined-numberY"
                name="y"
                value={properties.y}
                label="Y"
                type="number"
                onChange={handleChange(index)}
                InputLabelProps={{
                  shrink: true
                }}
                variant="outlined"
              />
              <TextField
                className={classes.textField}
                id="fontSize"
                name="size"
                label="Size"
                value={properties.size}
                type="number"
                onChange={handleChange(index)}
                InputLabelProps={{
                  shrink: true
                }}
                variant="outlined"
              />
            </li>
          ))}
        </ul>
        <ButtonComponent
          disabled={textDrawProperties.length === data[0].length}
          style={{ backgroundColor: '#f9af28' }}
          title="Add Field"
          className={classes.btn}
          onClick={addField}
        />
        <ButtonComponent
          className={classes.btn}
          title="Reset To Default"
          style={{ backgroundColor: '#ee6401' }}
          onClick={() => {
            resetToDefault()
          }}
        ></ButtonComponent>
        <ButtonComponent
          className={classes.btn}
          title="Download"
          onClick={() => {
            const c = canvas.current
            downloadPdf(c.toDataURL('png'), 'certificate-pdf')
            downloadImage(c.toDataURL('png'), 'certificate-image')
          }}
        />
        <ButtonComponent
          className={classes.btn}
          title="Send files to system"
          style={{ backgroundColor: '#03506a' }}
          onClick={() => {
            sendReq()
          }}
        />
        <ButtonComponent
          className={classes.btn}
          title="Download Merged certificates"
          style={{ backgroundColor: '#03517a' }}
          onClick={() => {
            certificateDownload()
          }}
        />
        {/* <ButtonComponent
          className={classes.btn}
          title="Download Merged Certificates"
          style={{ backgroundColor: '#03456a' }}
          onClick={() => {
            mergedCertificateDownload()
          }}
        /> */}
        <Divider style={{ marginTop: '0vh' }} />
        <div
          className={classes.drawerHeader}
          onClick={() => {
            setOpen(!open)
          }}
        >
          <IconButton>
            <ChevronRightIcon />
          </IconButton>
          <Typography style={{ display: 'inline' }}>Close</Typography>
        </div>
      </Drawer>

      <canvas ref={canvas}></canvas>
      {!open ? (
        <Fab
          className={classes.fab}
          color="primary"
          onClick={() => {
            setOpen(!open)
          }}
        >
          {open ? <CloseIcon /> : <EditIcon />}
        </Fab>
      ) : (
        <></>
      )}
    </div>
  )
}

function modifyield(defaultArray, dataArray) {
  while (dataArray.length > defaultArray.length) {
    defaultArray.push({
      title: 'Title',
      x: Math.floor(Math.random() * 100) + 80,
      y: Math.floor(Math.random() * 100) + 80,
      size: Math.floor(Math.random() * 100) + 10
    })
  }
  const deleteCount = defaultArray.length - dataArray.length
  if (dataArray.length < defaultArray.length) {
    defaultArray.splice(-1, deleteCount)
  }
  return defaultArray
}

export default CertificateGeneratorByImage
