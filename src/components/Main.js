import React, {useState, useRef, useEffect} from 'react'
import styled from 'styled-components'

const MainCanvas = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    .hidden {
        display: none;
    }

    .canvas_container {
    position: relative;
    display: inline-block;
        overflow-x: hidden;
        overflow-y: hidden;
        max-width: 100%;
    }
    .canvas {
        min-width: 100px;
    }
    .cropper {
        width: 100%;
        height:100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    .crop_square {
        display: ${({isCrop}) => isCrop ? `block`:`none`};
        position: absolute;
        cursor: move;
        left: ${props => props.cropper.left}px;
        top: ${props => props.cropper.top}px;
        width: ${props => props.cropper.width}px;
        height: ${props => props.cropper.height}px;
        touch-action: manipulation;
        box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5);
        box-sizing: border-box;
    }
    .crop_square_margin {
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 2px;
        border: 1px solid #333;
        opacity: 0.8;
        position: absolute;
    }
    .ne {
        top: -5px;
        right: -5px;
        cursor: ne-resize;
    }
    .se {
        bottom: -5px;
        right: -5px;
        cursor: se-resize;
    }
    .sw {
        bottom: -5px;
        left: -5px;
        cursor: sw-resize;
    }
    .nw {
        top: -5px;
        left: -5px;
        cursor: nw-resize;
    }
    img {
        width: 100%;
    }
`

const Main = () => {
    const storage = window.firebase.storage();
    const allInputs = {imgUrl: ''}
    const [imageAsFile, setImageAsFile] = useState('')
    const [imageAsUrl, setImageAsUrl] = useState(allInputs)
    const [load, setLoad] = useState(false)
    const canvas = useRef()
    const image = useRef()
    let ctx

    useEffect(() => {
        console.log(canvas.current)
        ctx = canvas.current.getContext("2d")
        
    }, [canvas])

    const [file, setFile] = useState('')
    async function fileHandler(e) {
        setImageAsFile(e.target.files[0])
        const reader = new FileReader();
        reader.onloadend = function(event) {
            setFile(reader.result)
        }
        await reader.readAsDataURL(e.target.files[0])
        // setFile(reader.result)
        setLoad(true)
        await canvasHandler(e)
        await canvasHandler()
    }

    function canvasHandler(e) {
        image.current.onload = () => {
            ctx.drawImage(image.current, 0, 0)
            ctx.front = "40px Courier"
            // ctx.fillText(text, 210, 75)
        }
    }

    const firebaseHandler = e => {
        e.preventDefault();
        const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile);
        uploadTask.on('state_changed', 
        (snapShot) => {
          //takes a snap shot of the process as it is happening
          console.log(snapShot)
        }, (err) => {
          //catches the errors
          console.log(err)
        }, () => {
          // gets the functions from storage refences the image storage in firebase by the children
          // gets the download url then sets the image from firebase as the value for the imgUrl key:
          storage.ref('images').child(imageAsFile.name).getDownloadURL()
           .then(fireBaseUrl => {
             setImageAsUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}))
           })
        })
    }

    const getCroppedImg = (image, crop) => {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
         )
    
        const reader = new FileReader()
        canvas.toBlob(blob => {
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                this.dataURLtoFile(reader.result, 'cropped.jpg')
            }
        })
    }


    return (
        <MainCanvas>
            <div className="canvas_container">
                <canvas ref={canvas} width={600} height={400} className="hidden" />
                <div className="canvas">
                    <div className="cropper">
                        <div className="crop_square">
                            <div className="crop_square_margin ne"></div>
                            <div className="crop_square_margin se"></div>
                            <div className="crop_square_margin sw"></div>
                            <div className="crop_square_margin nw"></div>
                        </div>
                    </div>
                    {load ? <img ref={image} src={file} alt="uploadedImg" />:null}  
                </div>
            </div>
            <div>
            <form onSubmit={firebaseHandler}>
                <label>
                    <input type='file' onChange={fileHandler}/>
                </label>
                <input type='submit' value='submit' />
            </form>
            </div>
        </MainCanvas>
    )
}

export default Main

