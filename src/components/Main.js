import React, {useState, useRef, useEffect} from 'react'
import styled from 'styled-components'

const MainCanvas = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    .hidden {
        display: none;
    }
    .resize-container {
    position: relative;
    display: inline-block;
    cursor: move;
    margin: 0 auto;
    }

    .resize-container img {
        display: block
    }

    .resize-container:hover img,
    .resize-container:active img {
        outline: 2px dashed rgba(222,60,80,.9);
    }
    .resize-handle-ne,
    .resize-handle-ne,
    .resize-handle-se,
    .resize-handle-nw,
    .resize-handle-sw {
        position: absolute;
        display: block;
        width: 10px;
        height: 10px;
        background: rgba(222,60,80,.9);
        z-index: 999;
    }

    .canvas_container {
        position: relative;
    }
    .canvas {
        width: 100%;
        height: 100%;
    }
    .cropper {
        width: 1000px;
        height: 700px;
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(0,0,0,.7);
    }
    .crop_square {
        position: absolute;
        cursor: move;
        left: 101px;
        top: 121px;
        width: 811px;
        height: 406px;
        background-color: gold;
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
        await canvasHandler()
    }

    function canvasHandler() {
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
            <form onSubmit={firebaseHandler}>
                <label>
                    <input type='file' onChange={fileHandler}/>
                </label>
                <input type='submit' value='submit' />
            </form>
        </MainCanvas>
    )
}

export default Main

