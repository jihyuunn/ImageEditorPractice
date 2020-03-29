import React, {useState, useRef, useEffect} from 'react'
import styled from 'styled-components'

const MainCanvas = styled.div`
    .hidden {
        display: none;
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
            <form onSubmit={firebaseHandler}>
                <label>
                    <input type='file' onChange={fileHandler}/>
                </label>
                <input type='submit' value='submit' />
            </form>
            <div>
                <canvas ref={canvas} width={600} height={400} className="hidden" />
            </div>
        </MainCanvas>
    )
}

export default Main

